module.exports = function (app) {
  app.get('/pterodactyl/listpanel', async (req, res) => {
    const { apikey, eggid, nestid, loc, domain, ptla, ptlc } = req.query;

    // Validasi API Key
    if (!global.apikey.includes(apikey)) {
      return res.json({ status: false, error: 'Apikey invalid' });
    }

    // Validasi parameter wajib
    if (!domain || !ptla) {
      return res.json({ status: false, error: 'Parameter domain & ptla wajib diisi' });
    }

    const headers = {
      "Authorization": `Bearer ${ptla}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    try {
      // Ambil daftar server
      const response = await fetch(`${domain}/api/application/servers`, { headers });
      const data = await response.json();

      if (!data || !data.data) {
        return res.json({ status: false, error: "Gagal mengambil data server", detail: data });
      }

      // Filter berdasarkan nestid, eggid, loc (jika diisi)
      const filtered = data.data.filter(server => {
        const attr = server.attributes;
        return (!nestid || attr.nest === parseInt(nestid)) &&
               (!eggid || attr.egg === parseInt(eggid)) &&
               (!loc || attr.location === parseInt(loc));
      });

      const result = filtered.map(srv => {
        return {
          id: srv.attributes.id,
          name: srv.attributes.name,
          uuid: srv.attributes.uuid,
          identifier: srv.attributes.identifier,
          user: srv.attributes.user,
          limits: srv.attributes.limits,
          created_at: srv.attributes.created_at
        };
      });

      res.json({
        status: true,
        total: result.length,
        servers: result
      });

    } catch (err) {
      res.json({
        status: false,
        error: "Terjadi kesalahan saat mengambil list panel",
        detail: err.message
      });
    }
  });
};