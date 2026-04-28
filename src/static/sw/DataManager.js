export class DataManager {
  constructor(core) {
    this.core = core;
  }

  async retrieveIndexCfg() {
    const db = await bbn.db.open('bbn');
    if (db) {
      const row = await db.select('data', [], { id: 'sw' });
      if (row?.content) {
        this.core.indexCfg = row.content;
      }
    }

    try {
      const tmp = await this.core.fetch(this.core.data.plugins['appui-core'] + '/index', {get: 1});
      if (tmp?.data) {
        this.core.indexCfg = tmp.data;
        if (db) {
          await db.insert('data', {
            id: 'sw',
            content: this.core.indexCfg,
            version: this.core.indexCfg.version,
            fingerprint: this.core.indexCfg.fingerprint
          }, true);
        }
      }
    } catch (e) {
      this.core.log("Error parsing JSON from core/index");
      this.core.log(e);
    } finally {
      db.close("bbn");
    }
  }

  async retrieveLoginCfg() {
    try {
      const tmp = await this.core.fetch(this.core.data.plugins['appui-core'] + '/index', {get: 1});
      if (tmp) {
        this.core.loginCfg = tmp?.data;
      }
    } catch (e) {
      this.core.log("Error parsing JSON from core/index");
      this.core.log(e);
    }
  }

  async setUpDb() {
    if (!bbn.db._structures?.bbn?.data) {
      await bbn.db.add('bbn', 'data', {
        keys: {
          PRIMARY: { columns: ['id'], unique: true },
          FINGERPRINT: { columns: ['fingerprint'], unique: false },
          VERSION: { columns: ['version'], unique: false }
        },
        fields: {
          id: {},
          content: {},
          version: {},
          fingerprint: {}
        }
      });
    }
  }
}
