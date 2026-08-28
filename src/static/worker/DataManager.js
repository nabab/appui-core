export class DataManager {
  constructor(core, dbCenter) {
    this.core = core;
    this.dbCenter = dbCenter;
  }

  async handleMessage(message) {
    return this.dbCenter.handleMessage(message);
  }

  async retrieveIndexCfg() {
    const db = await bbn.db.open('bbn');
    if (db) {
      const row = await db.select('data', [], { id: 'sw' });
      if (row?.content) {
        this.indexCfg = row.content;
      }
    }


    try {
      if (!this.indexCfg?.version) {
        const tmp = await this.core.fetch(this.core.data.plugins['appui-core'] + '/index', {get: 1});
        if (tmp?.data) {
          this.indexCfg = tmp.data;
          if (db) {
            await db.insert('data', {
              id: 'sw',
              content: this.indexCfg,
              version: this.indexCfg.version,
              fingerprint: this.indexCfg.fingerprint
            }, true);
          }
        }
      }
    } catch (e) {
      this.core.log("Error parsing JSON from core/index");
      this.core.log(e);
    } finally {
      if (db) {
        db.close("bbn");
      }
    }
  }

  async retrieveLoginCfg() {
    try {
      const tmp = await this.core.fetch(this.core.data.plugins['appui-core'] + '/index', {get: 1});
      if (tmp) {
        this.loginCfg = tmp?.data;
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
