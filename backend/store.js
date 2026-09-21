const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const empty = () => ({ users: {}, codes: {}, sessions: {}, bookings: [] });

let db = empty();

function load() {
  try {
    db = Object.assign(empty(), JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    db = empty();
  }
}

// كتابة على ملف مؤقت وبعدين rename عشان الملف ميبوظش لو السيرفر وقف في نص الكتابة
function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

load();

module.exports = {
  get db() {
    return db;
  },
  save,
};
