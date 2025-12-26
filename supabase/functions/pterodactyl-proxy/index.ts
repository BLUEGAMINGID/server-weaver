import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-server-uuid',
};

const PTERODACTYL_PANEL_URL = Deno.env.get('PTERODACTYL_PANEL_URL');
const PTERODACTYL_API_KEY = Deno.env.get('PTERODACTYL_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serverUUID = req.headers.get('x-server-uuid');
    
    if (!serverUUID) {
      console.error('Missing server UUID');
      return new Response(JSON.stringify({ error: 'Server UUID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!PTERODACTYL_PANEL_URL || !PTERODACTYL_API_KEY) {
      console.error('Missing Pterodactyl configuration');
      return new Response(JSON.stringify({ error: 'Pterodactyl configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log(`Processing action: ${action} for server: ${serverUUID}`);

    const baseUrl = PTERODACTYL_PANEL_URL.replace(/\/$/, '');
    const headers = {
      'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    let response;
    let result;

    switch (action) {
      case 'status': {
        // Get server details
        const serverRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}`, { headers });
        const serverData = await serverRes.json();
        
        // Get server resources
        const resourcesRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/resources`, { headers });
        const resourcesData = await resourcesRes.json();

        console.log('Server data:', JSON.stringify(serverData));
        console.log('Resources data:', JSON.stringify(resourcesData));

        if (serverData.errors || resourcesData.errors) {
          throw new Error(serverData.errors?.[0]?.detail || resourcesData.errors?.[0]?.detail || 'Failed to fetch server data');
        }

        result = {
          id: serverData.attributes?.uuid || serverUUID,
          name: serverData.attributes?.name || 'Unknown Server',
          status: resourcesData.attributes?.current_state || 'offline',
          memory: {
            current: Math.round((resourcesData.attributes?.resources?.memory_bytes || 0) / 1024 / 1024),
            limit: serverData.attributes?.limits?.memory || 0,
          },
          cpu: resourcesData.attributes?.resources?.cpu_absolute || 0,
          disk: {
            current: Math.round((resourcesData.attributes?.resources?.disk_bytes || 0) / 1024 / 1024),
            limit: serverData.attributes?.limits?.disk || 0,
          },
        };
        break;
      }

      case 'console': {
        // Get console websocket credentials
        const consoleRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/websocket`, { headers });
        const consoleData = await consoleRes.json();
        
        console.log('Console websocket data:', JSON.stringify(consoleData));

        result = {
          socket: consoleData.data?.socket,
          token: consoleData.data?.token,
        };
        break;
      }

      case 'command': {
        const body = await req.json();
        const command = body.command;

        console.log(`Sending command: ${command}`);

        response = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/command`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ command }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Command error:', errorText);
          throw new Error(`Failed to send command: ${response.status}`);
        }

        result = { success: true };
        break;
      }

      case 'power': {
        const body = await req.json();
        const signal = body.signal; // start, stop, restart, kill

        console.log(`Power action: ${signal}`);

        response = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/power`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ signal }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Power error:', errorText);
          throw new Error(`Failed to send power signal: ${response.status}`);
        }

        result = { success: true };
        break;
      }

      case 'files': {
        const directory = url.searchParams.get('directory') || '/';
        
        const filesRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/list?directory=${encodeURIComponent(directory)}`, { headers });
        const filesData = await filesRes.json();

        console.log('Files data:', JSON.stringify(filesData));

        result = filesData.data || [];
        break;
      }

      case 'file-content': {
        const filePath = url.searchParams.get('file') || '';
        
        const fileRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent(filePath)}`, { headers });
        const fileContent = await fileRes.text();

        console.log('File content fetched for:', filePath);

        result = { content: fileContent };
        break;
      }

      case 'file-write': {
        const body = await req.json();
        const { file, content } = body;

        console.log(`Writing file: ${file}`);

        response = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/write?file=${encodeURIComponent(file)}`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'text/plain',
          },
          body: content,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('File write error:', errorText);
          throw new Error(`Failed to write file: ${response.status}`);
        }

        result = { success: true };
        break;
      }

      case 'players': {
        // Read the ops.json, whitelist.json, and banned-players.json files
        const promises = [
          fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent('/ops.json')}`, { headers }).then(r => r.text()).catch(() => '[]'),
          fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent('/whitelist.json')}`, { headers }).then(r => r.text()).catch(() => '[]'),
          fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent('/banned-players.json')}`, { headers }).then(r => r.text()).catch(() => '[]'),
          fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent('/banned-ips.json')}`, { headers }).then(r => r.text()).catch(() => '[]'),
        ];

        const [ops, whitelist, bannedPlayers, bannedIps] = await Promise.all(promises);

        let opsList = [];
        let whitelistList = [];
        let bannedList = [];
        let bannedIpsList = [];

        try { opsList = JSON.parse(ops); } catch { opsList = []; }
        try { whitelistList = JSON.parse(whitelist); } catch { whitelistList = []; }
        try { bannedList = JSON.parse(bannedPlayers); } catch { bannedList = []; }
        try { bannedIpsList = JSON.parse(bannedIps); } catch { bannedIpsList = []; }

        console.log('Players data loaded');

        result = {
          ops: opsList,
          whitelist: whitelistList,
          banned: bannedList,
          bannedIps: bannedIpsList,
        };
        break;
      }

      case 'properties': {
        // Read server.properties file
        const propsRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent('/server.properties')}`, { headers });
        const propsContent = await propsRes.text();

        console.log('Properties fetched');

        // Parse properties
        const properties: Array<{ key: string; value: string | number | boolean; type: string; description: string }> = [];
        const lines = propsContent.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=');
            
            let parsedValue: string | number | boolean = value;
            let type = 'string';

            if (value === 'true' || value === 'false') {
              parsedValue = value === 'true';
              type = 'boolean';
            } else if (!isNaN(Number(value)) && value !== '') {
              parsedValue = Number(value);
              type = 'number';
            }

            properties.push({
              key: key.trim(),
              value: parsedValue,
              type,
              description: '',
            });
          }
        }

        result = properties;
        break;
      }

      case 'update-property': {
        const body = await req.json();
        const { key, value } = body;

        // First get current properties
        const propsRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent('/server.properties')}`, { headers });
        const propsContent = await propsRes.text();

        // Update the property
        const lines = propsContent.split('\n');
        let updated = false;
        const newLines = lines.map(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [lineKey] = trimmed.split('=');
            if (lineKey.trim() === key) {
              updated = true;
              return `${key}=${value}`;
            }
          }
          return line;
        });

        if (!updated) {
          newLines.push(`${key}=${value}`);
        }

        const newContent = newLines.join('\n');

        console.log(`Updating property: ${key}=${value}`);

        response = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/write?file=${encodeURIComponent('/server.properties')}`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'text/plain',
          },
          body: newContent,
        });

        if (!response.ok) {
          throw new Error(`Failed to update property: ${response.status}`);
        }

        result = { success: true };
        break;
      }

      case 'addons': {
        // Read behavior_packs and resource_packs directories
        const behaviorRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/list?directory=${encodeURIComponent('/behavior_packs')}`, { headers });
        const resourceRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/list?directory=${encodeURIComponent('/resource_packs')}`, { headers });

        let behaviorPacks: any[] = [];
        let resourcePacks: any[] = [];

        try {
          const behaviorData = await behaviorRes.json();
          behaviorPacks = behaviorData.data || [];
        } catch {
          console.log('No behavior packs directory');
        }

        try {
          const resourceData = await resourceRes.json();
          resourcePacks = resourceData.data || [];
        } catch {
          console.log('No resource packs directory');
        }

        // Read world_behavior_packs.json and world_resource_packs.json for enabled status
        const worldBehaviorRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent('/world_behavior_packs.json')}`, { headers }).then(r => r.text()).catch(() => '[]');
        const worldResourceRes = await fetch(`${baseUrl}/api/client/servers/${serverUUID}/files/contents?file=${encodeURIComponent('/world_resource_packs.json')}`, { headers }).then(r => r.text()).catch(() => '[]');

        let enabledBehavior: any[] = [];
        let enabledResource: any[] = [];

        try { enabledBehavior = JSON.parse(worldBehaviorRes); } catch { enabledBehavior = []; }
        try { enabledResource = JSON.parse(worldResourceRes); } catch { enabledResource = []; }

        console.log('Addons data loaded');

        result = {
          behaviorPacks: behaviorPacks.filter(p => p.attributes?.is_file === false).map((p, i) => ({
            id: p.attributes?.name || `bp-${i}`,
            name: p.attributes?.name || 'Unknown Pack',
            type: 'behavior',
            version: '1.0.0',
            uuid: p.attributes?.name || `bp-${i}`,
            enabled: enabledBehavior.some(e => e.pack_id === p.attributes?.name),
            priority: i + 1,
          })),
          resourcePacks: resourcePacks.filter(p => p.attributes?.is_file === false).map((p, i) => ({
            id: p.attributes?.name || `rp-${i}`,
            name: p.attributes?.name || 'Unknown Pack',
            type: 'resource',
            version: '1.0.0',
            uuid: p.attributes?.name || `rp-${i}`,
            enabled: enabledResource.some(e => e.pack_id === p.attributes?.name),
            priority: i + 1,
          })),
        };
        break;
      }

      default:
        console.error('Unknown action:', action);
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pterodactyl-proxy function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
