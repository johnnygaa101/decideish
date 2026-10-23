// Supabase connection.
// Paste your project's public key below (Supabase calls it "publishable" or "anon").
// Never paste the secret / service_role key here, this file is public.
var SUPABASE_URL = "https://xoqmolbfxjjwlgxwibis.supabase.co";
var SUPABASE_KEY = "sb_publishable_YqwqpGSm2ati-Ajh1e4ozA_nAAThd3T";

// small storage helpers (quiz.html and dashboard.html have their own copies too)
function dsLoad(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (err) { return fallback; }
}

// db stays null until a key is pasted, and the site keeps working like before
var db = null;
if (window.supabase && SUPABASE_KEY.indexOf("PASTE_") === -1) {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// localStorage keys that also get saved to the user_data table
var SYNCED_KEYS = ["tasteProfile", "pickHistory", "ratings", "journal",
                   "latestPick", "quizAnswers", "spins", "badgesSeen"];

// save one key to Supabase if someone is logged in
function cloudSave(key, value) {
  if (!db || SYNCED_KEYS.indexOf(key) === -1) return;
  db.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (!session) return;
    db.from("user_data")
      .upsert({ user_id: session.user.id, key: key, value: value, updated_at: new Date().toISOString() })
      .then(function (r) {
        if (r.error) console.warn("Supabase save failed:", r.error.message);
      });
  });
}

// after logging in: copy the user's saved data into this browser.
// if they have nothing saved yet, upload what's already in this browser instead.
async function cloudLoad(user) {
  if (!db) return;
  var res = await db.from("user_data").select("key, value").eq("user_id", user.id);
  if (res.error) {
    console.warn("Supabase load failed:", res.error.message);
    return;
  }
  if (res.data.length === 0) {
    SYNCED_KEYS.forEach(function (k) {
      var local = dsLoad(k, null);
      if (local !== null) cloudSave(k, local);
    });
    return;
  }
  clearLocalData();
  res.data.forEach(function (row) {
    try { localStorage.setItem(row.key, JSON.stringify(row.value)); } catch (err) {}
  });
}

// on log out, remove the user's data from this browser
function clearLocalData() {
  SYNCED_KEYS.concat(["memberName"]).forEach(function (k) {
    try { localStorage.removeItem(k); } catch (err) {}
  });
}

// first name saved at sign-up, or the start of the email
function nameFor(user) {
  var meta = user.user_metadata || {};
  return meta.first_name || (user.email || "").split("@")[0];
}

// names used by signin.html and signup.html
var clearLocalUserData = clearLocalData;
function localSet(key, value) {
  try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (err) {}
}

// load the restaurant list from the restaurants table.
// resolves to the list, or null if there's no connection (the quiz then uses its backup list)
async function loadRestaurants() {
  if (!db) return null;
  var res = await db.from("restaurants").select("*");
  if (res.error) {
    console.warn("Couldn't load restaurants, using the backup list:", res.error.message);
    return null;
  }
  return res.data.map(function (r) {
    return {
      name: r.name, cuisine: r.cuisine, budget: r.budget, moods: r.moods || [],
      miles: r.miles === null ? undefined : Number(r.miles), address: r.address
    };
  });
}

// only the quiz needs the list
var restaurantsReady = document.getElementById("quiz") ? loadRestaurants() : Promise.resolve(null);
