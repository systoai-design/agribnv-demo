import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@libsql/client@0.6.0/web";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Turso client
const getTursoClient = () => {
  const url = Deno.env.get('TURSO_DATABASE_URL');
  const authToken = Deno.env.get('TURSO_AUTH_TOKEN');
  
  if (!url || !authToken) {
    throw new Error('Missing Turso configuration');
  }
  
  return createClient({ url, authToken });
};

// Initialize database tables if they don't exist
const initializeDatabase = async (client: ReturnType<typeof createClient>) => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      address TEXT,
      latitude REAL,
      longitude REAL,
      price_per_night REAL NOT NULL,
      max_guests INTEGER NOT NULL DEFAULT 2,
      bedrooms INTEGER NOT NULL DEFAULT 1,
      bathrooms INTEGER NOT NULL DEFAULT 1,
      category TEXT NOT NULL DEFAULT 'organic_farm',
      listing_type TEXT NOT NULL DEFAULT 'farm_stay',
      subcategory TEXT NOT NULL DEFAULT 'agrifarm',
      amenities TEXT DEFAULT '[]',
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS property_images (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_hours REAL NOT NULL DEFAULT 2,
      max_participants INTEGER NOT NULL DEFAULT 10,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )
  `);

  // Create indexes
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_properties_subcategory ON properties(subcategory)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_experiences_property_id ON experiences(property_id)`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const client = getTursoClient();
    const { action, params } = await req.json();

    switch (action) {
      case 'init': {
        await initializeDatabase(client);
        return new Response(JSON.stringify({ success: true, message: 'Database initialized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'getProperties': {
        const { listing_type, subcategory, search, price_min, price_max, guests } = params || {};
        
        let sql = `
          SELECT p.*, 
            (SELECT json_group_array(json_object(
              'id', pi.id,
              'property_id', pi.property_id,
              'image_url', pi.image_url,
              'is_primary', pi.is_primary,
              'display_order', pi.display_order
            )) FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.display_order) as images_json,
            (SELECT json_group_array(json_object(
              'id', e.id,
              'property_id', e.property_id,
              'name', e.name,
              'description', e.description,
              'price', e.price,
              'duration_hours', e.duration_hours,
              'max_participants', e.max_participants,
              'is_active', e.is_active
            )) FROM experiences e WHERE e.property_id = p.id AND e.is_active = 1) as experiences_json
          FROM properties p
          WHERE p.is_published = 1
        `;
        
        const queryParams: any[] = [];
        
        if (listing_type && listing_type !== 'all') {
          sql += ` AND p.listing_type = ?`;
          queryParams.push(listing_type);
        }
        
        if (subcategory && subcategory.length > 0) {
          const placeholders = subcategory.map(() => '?').join(',');
          sql += ` AND p.subcategory IN (${placeholders})`;
          queryParams.push(...subcategory);
        }
        
        if (search) {
          sql += ` AND (p.name LIKE ? OR p.location LIKE ?)`;
          queryParams.push(`%${search}%`, `%${search}%`);
        }
        
        if (price_min !== undefined) {
          sql += ` AND p.price_per_night >= ?`;
          queryParams.push(price_min);
        }
        
        if (price_max !== undefined) {
          sql += ` AND p.price_per_night <= ?`;
          queryParams.push(price_max);
        }
        
        if (guests && guests > 1) {
          sql += ` AND p.max_guests >= ?`;
          queryParams.push(guests);
        }
        
        sql += ` ORDER BY p.created_at DESC`;
        
        const result = await client.execute({ sql, args: queryParams });
        
        const properties = result.rows.map((row: any) => ({
          ...row,
          is_published: row.is_published === 1,
          amenities: row.amenities ? JSON.parse(row.amenities) : [],
          images: row.images_json ? JSON.parse(row.images_json).filter((i: any) => i.id) : [],
          experiences: row.experiences_json ? JSON.parse(row.experiences_json).filter((e: any) => e.id) : [],
        }));
        
        return new Response(JSON.stringify({ data: properties }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'getProperty': {
        const { id } = params;
        
        const result = await client.execute({
          sql: `
            SELECT p.*,
              (SELECT json_group_array(json_object(
                'id', pi.id,
                'property_id', pi.property_id,
                'image_url', pi.image_url,
                'is_primary', pi.is_primary,
                'display_order', pi.display_order
              )) FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.display_order) as images_json,
              (SELECT json_group_array(json_object(
                'id', e.id,
                'property_id', e.property_id,
                'name', e.name,
                'description', e.description,
                'price', e.price,
                'duration_hours', e.duration_hours,
                'max_participants', e.max_participants,
                'is_active', e.is_active
              )) FROM experiences e WHERE e.property_id = p.id AND e.is_active = 1) as experiences_json
            FROM properties p
            WHERE p.id = ?
          `,
          args: [id]
        });
        
        if (result.rows.length === 0) {
          return new Response(JSON.stringify({ data: null, error: 'Property not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const row = result.rows[0] as any;
        const property = {
          ...row,
          is_published: row.is_published === 1,
          amenities: row.amenities ? JSON.parse(row.amenities) : [],
          images: row.images_json ? JSON.parse(row.images_json).filter((i: any) => i.id) : [],
          experiences: row.experiences_json ? JSON.parse(row.experiences_json).filter((e: any) => e.id) : [],
        };
        
        return new Response(JSON.stringify({ data: property }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'migrateFromSupabase': {
        // This action receives properties from Supabase and inserts them into Turso
        const { properties } = params;
        
        await initializeDatabase(client);
        
        let migrated = 0;
        
        // Process in batches for better reliability
        const batchSize = 10;
        
        for (let i = 0; i < properties.length; i += batchSize) {
          const batch = properties.slice(i, i + batchSize);
          
          for (const prop of batch) {
            try {
              // Generate subcategory based on category
              const subcategoryMap: Record<string, string> = {
                'fruit_picking': 'agrifarm',
                'livestock': 'agrifarm',
                'wellness': 'homestay',
                'farm_to_table': 'farm_cottage',
                'eco_trail': 'camp_stay',
                'organic_farm': 'agrifarm',
              };
              
              const subcategory = subcategoryMap[prop.category] || 'agrifarm';
              
              await client.execute({
                sql: `
                  INSERT OR REPLACE INTO properties 
                  (id, host_id, name, description, location, address, latitude, longitude, 
                   price_per_night, max_guests, bedrooms, bathrooms, category, listing_type, 
                   subcategory, amenities, is_published, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                  prop.id,
                  prop.host_id,
                  prop.name,
                  prop.description,
                  prop.location,
                  prop.address,
                  prop.latitude,
                  prop.longitude,
                  prop.price_per_night,
                  prop.max_guests,
                  prop.bedrooms,
                  prop.bathrooms,
                  prop.category,
                  'farm_stay',
                  subcategory,
                  JSON.stringify(prop.amenities || []),
                  prop.is_published ? 1 : 0,
                  prop.created_at,
                  prop.updated_at
                ]
              });
              
              // Insert images (limit to first 5)
              if (prop.images && Array.isArray(prop.images)) {
                const limitedImages = prop.images.slice(0, 5);
                for (const img of limitedImages) {
                  await client.execute({
                    sql: `
                      INSERT OR REPLACE INTO property_images 
                      (id, property_id, image_url, is_primary, display_order, created_at)
                      VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    args: [
                      img.id,
                      img.property_id,
                      img.image_url,
                      img.is_primary ? 1 : 0,
                      img.display_order,
                      img.created_at
                    ]
                  });
                }
              }
              
              // Insert experiences
              if (prop.experiences && Array.isArray(prop.experiences)) {
                for (const exp of prop.experiences) {
                  await client.execute({
                    sql: `
                      INSERT OR REPLACE INTO experiences 
                      (id, property_id, name, description, price, duration_hours, 
                       max_participants, is_active, created_at, updated_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    args: [
                      exp.id,
                      exp.property_id,
                      exp.name,
                      exp.description,
                      exp.price,
                      exp.duration_hours,
                      exp.max_participants,
                      exp.is_active ? 1 : 0,
                      exp.created_at,
                      exp.updated_at
                    ]
                  });
                }
              }
              
              migrated++;
            } catch (propError) {
              console.error(`Failed to migrate property ${prop.id}:`, propError);
            }
          }
        }
        
        return new Response(JSON.stringify({ success: true, migrated }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'updatePropertyFilters': {
        // Update listing_type and subcategory for specific properties
        const { updates } = params;
        
        for (const update of updates) {
          await client.execute({
            sql: `UPDATE properties SET listing_type = ?, subcategory = ?, updated_at = datetime('now') WHERE id = ?`,
            args: [update.listing_type, update.subcategory, update.id]
          });
        }
        
        return new Response(JSON.stringify({ success: true, updated: updates.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Turso DB Error:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
