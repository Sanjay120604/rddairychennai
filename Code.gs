/*************************************************************
 *  RD DAIRY — Backend (Google Apps Script)
 *  Actions: register, login, placeOrder, placeSubscription,
 *           updateStatus, getAdminData, getStats
 *
 *  One Google Sheet = whole database. Tabs are auto-created:
 *    Users | Orders | Subscriptions
 *
 *  Passwords are SALTED + SHA-256 hashed (never stored plain).
 *  Mobile number is the unique key: one mobile = one account.
 *************************************************************/

/* CONFIG: your private password salt. Set once, never change. */
var SALT = "RD_dairy_x7Qm29vLpK4tZbN8wR3jH6sF1aYcE5gD0uViO_2026";

/* CONFIG: admin password to view admin & stats pages. Change this. */
var ADMIN_KEY = "rdadmin2026";

var USERS_SHEET = "Users";
var ORDERS_SHEET = "Orders";
var SUBS_SHEET = "Subscriptions";

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === "register")          return json(register(body));
    if (action === "login")             return json(login(body));
    if (action === "placeOrder")        return json(placeOrder(body));
    if (action === "placeSubscription") return json(placeSubscription(body));
    if (action === "updateStatus")      return json(updateStatus(body));
    if (action === "getAdminData")      return json(getAdminData(body));
    if (action === "getStats")          return json(getStats(body));
    if (action === "saveProfile")       return json(saveProfile(body));
    if (action === "getProfile")        return json(getProfile(body));
    return json({ success: false, message: "Unknown action." });
  } catch (err) {
    return json({ success: false, message: "Server error: " + err.message });
  }
}

function doGet() { return json({ success: true, message: "RD Dairy backend is running." }); }

/* ---------------- AUTH ---------------- */
function register(b) {
  var name = (b.name || "").toString().trim();
  var mobile = (b.mobile || "").toString().trim();
  var password = (b.password || "").toString();
  if (!name)                    return { success: false, message: "Name is required." };
  if (!/^\d{10}$/.test(mobile)) return { success: false, message: "Enter a valid 10-digit mobile number." };
  if (password.length < 6)      return { success: false, message: "Password must be at least 6 characters." };
  var sheet = getUsersSheet();
  if (findRowByMobile(sheet, mobile)) return { success: false, message: "User already exists. Please login instead." };
  sheet.appendRow([mobile, name, hashPassword(password), new Date()]);
  return { success: true, message: "Account created." };
}

function login(b) {
  var mobile = (b.mobile || "").toString().trim();
  var password = (b.password || "").toString();
  if (!/^\d{10}$/.test(mobile)) return { success: false, message: "Enter a valid 10-digit mobile number." };
  var row = findRowByMobile(getUsersSheet(), mobile);
  if (!row) return { success: false, message: "No account found for this number. Please register." };
  if (hashPassword(password) !== row.data[2]) return { success: false, message: "Incorrect password." };
  var email = row.data[4] || "", address = row.data[5] || "";
  return { success: true, name: row.data[1], email: email, address: address,
           profileComplete: !!(address && address.toString().trim()), message: "Login successful." };
}

/* ---------------- PROFILE ---------------- */
function saveProfile(b) {
  var mobile = (b.mobile || "").toString().trim();
  var name = (b.name || "").toString().trim();
  var email = (b.email || "").toString().trim();
  var address = (b.address || "").toString().trim();
  if (!/^\d{10}$/.test(mobile)) return { success: false, message: "Invalid mobile." };
  if (!name)    return { success: false, message: "Name is required." };
  if (!address) return { success: false, message: "Address is required." };

  var sheet = getUsersSheet();
  var row = findRowByMobile(sheet, mobile);
  if (!row) return { success: false, message: "Account not found. Please register again." };

  sheet.getRange(row.rowNumber, 2).setValue(name);    // Name (col B)
  sheet.getRange(row.rowNumber, 5).setValue(email);   // Email (col E)
  sheet.getRange(row.rowNumber, 6).setValue(address); // Address (col F)
  return { success: true, message: "Profile saved.", name: name, email: email, address: address };
}

function getProfile(b) {
  var mobile = (b.mobile || "").toString().trim();
  var row = findRowByMobile(getUsersSheet(), mobile);
  if (!row) return { success: false, message: "Account not found." };
  var address = row.data[5] || "";
  return { success: true, name: row.data[1] || "", email: row.data[4] || "",
           address: address, profileComplete: !!(address && address.toString().trim()) };
}

/* ---------------- ORDERS ---------------- */
function placeOrder(b) {
  var name = (b.name || "").toString().trim();
  var mobile = (b.mobile || "").toString().trim();
  var address = (b.address || "").toString().trim();
  var items = b.items || [];
  var total = Number(b.total) || 0;
  var payMethod = (b.payMethod || "UPI / QR").toString();
  var paymentRef = (b.paymentRef || "").toString().trim();
  if (!name || !mobile) return { success: false, message: "Please login before ordering." };
  if (!address)         return { success: false, message: "Delivery address is required." };
  if (!items.length)    return { success: false, message: "Your cart is empty." };

  var itemsText = items.map(function (it) {
    return it.name + " (" + it.variant + ") x" + it.qty + " = Rs." + (it.price * it.qty);
  }).join("; ");
  var totalQty = items.reduce(function (s, it) { return s + Number(it.qty); }, 0);
  var orderId = "ORD" + (new Date().getTime().toString().slice(-8));
  var status;
  if (/cod/i.test(payMethod)) status = "COD - Pending Delivery";
  else status = paymentRef ? "Payment Submitted" : "Pending Payment";

  getOrdersSheet().appendRow([orderId, new Date(), name, mobile, address,
    itemsText, totalQty, total, payMethod, paymentRef, status]);
  return { success: true, orderId: orderId, message: "Order placed." };
}

/* ---------------- SUBSCRIPTIONS ---------------- */
function placeSubscription(b) {
  var name = (b.name || "").toString().trim();
  var mobile = (b.mobile || "").toString().trim();
  var address = (b.address || "").toString().trim();
  var product = (b.product || "").toString().trim();
  var qty = (b.qty || "1").toString();
  var plan = (b.plan || "Daily Delivery").toString();
  var total = Number(b.total) || 0;
  var paymentRef = (b.paymentRef || "").toString().trim();
  if (!name || !mobile) return { success: false, message: "Please login before subscribing." };
  if (!address)         return { success: false, message: "Delivery address is required." };
  if (!product)         return { success: false, message: "Please choose a product." };

  var subId = "SUB" + (new Date().getTime().toString().slice(-8));
  var status = paymentRef ? "Payment Submitted" : "Pending Confirmation";
  getSubsSheet().appendRow([subId, new Date(), name, mobile, address,
    product, qty, plan, total, paymentRef, status]);
  return { success: true, subId: subId, message: "Subscription requested." };
}

/* ---------------- ADMIN ---------------- */
function updateStatus(b) {
  if (b.adminKey !== ADMIN_KEY) return { success: false, message: "Unauthorized." };
  var sheet = b.type === "sub" ? getSubsSheet() : getOrdersSheet();
  var values = sheet.getDataRange().getValues();
  var statusCol = sheet.getLastColumn();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0].toString() === b.id) {
      sheet.getRange(i + 1, statusCol).setValue(b.status);
      return { success: true, message: "Status updated." };
    }
  }
  return { success: false, message: "Record not found." };
}

function getAdminData(b) {
  if (b.adminKey !== ADMIN_KEY) return { success: false, message: "Unauthorized." };
  return { success: true, orders: sheetToObjects(getOrdersSheet()), subscriptions: sheetToObjects(getSubsSheet()) };
}

function getStats(b) {
  if (b.adminKey !== ADMIN_KEY) return { success: false, message: "Unauthorized." };
  var orders = sheetToObjects(getOrdersSheet());
  var subs = sheetToObjects(getSubsSheet());
  var users = getUsersSheet().getLastRow() - 1; if (users < 0) users = 0;

  var revenue = 0, paidCount = 0, pendingCount = 0, byDay = {}, productCount = {};
  orders.forEach(function (o) {
    var amt = Number(o.Amount) || 0;
    var paid = /paid|received|confirmed/i.test((o.Status || "").toString());
    if (paid) { revenue += amt; paidCount++; } else { pendingCount++; }
    var d = o.Date ? new Date(o.Date) : null;
    if (d && !isNaN(d)) {
      var key = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
      byDay[key] = (byDay[key] || 0) + (paid ? amt : 0);
    }
    (o.Items || "").toString().split(";").forEach(function (part) {
      var m = part.trim().match(/^(.+?)\s*\(/);
      if (m) { var p = m[1].trim(); productCount[p] = (productCount[p] || 0) + 1; }
    });
  });
  var activeSubs = subs.filter(function (s) { return !/cancel/i.test((s.Status || "").toString()); }).length;

  var series = [];
  for (var i = 13; i >= 0; i--) {
    var dt = new Date(); dt.setDate(dt.getDate() - i);
    var k = Utilities.formatDate(dt, Session.getScriptTimeZone(), "yyyy-MM-dd");
    series.push({ date: k, revenue: byDay[k] || 0 });
  }
  return {
    success: true,
    totals: { users: users, orders: orders.length, subscriptions: subs.length,
      activeSubs: activeSubs, revenue: revenue, paidCount: paidCount, pendingCount: pendingCount },
    revenueSeries: series,
    topProducts: Object.keys(productCount).map(function (k) { return { product: k, count: productCount[k] }; })
      .sort(function (a, b) { return b.count - a.count; }).slice(0, 6)
  };
}

/* ---------------- HELPERS ---------------- */
function getUsersSheet() { return getOrMake(USERS_SHEET, ["Mobile", "Name", "PasswordHash", "RegisteredOn", "Email", "Address"]); }
function getOrdersSheet() { return getOrMake(ORDERS_SHEET, ["OrderId","Date","Name","Mobile","Address","Items","TotalQty","Amount","PayMethod","PaymentRef","Status"]); }
function getSubsSheet() { return getOrMake(SUBS_SHEET, ["SubId","Date","Name","Mobile","Address","Product","Qty","Plan","Amount","PaymentRef","Status"]); }
function getOrMake(name, header) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); }
  return sh;
}
function findRowByMobile(sheet, mobile) {
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0].toString().trim() === mobile) return { rowNumber: i + 1, data: values[i] };
  }
  return null;
}
function sheetToObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var header = values[0], out = [];
  for (var i = 1; i < values.length; i++) {
    var row = {};
    for (var c = 0; c < header.length; c++) {
      var val = values[i][c];
      if (val instanceof Date) val = val.toISOString();
      row[header[c].toString()] = val;
    }
    out.push(row);
  }
  return out.reverse();
}
function hashPassword(password) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, SALT + password, Utilities.Charset.UTF_8);
  return raw.map(function (x) { return ((x & 0xff) + 0x100).toString(16).slice(1); }).join("");
}
function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
