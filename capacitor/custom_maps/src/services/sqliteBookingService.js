import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db;

export const initBookingDB = async () => {
  try {
    db = await sqlite.createConnection('bookingDB', false, 'no-encryption', 1);
    await db.open();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        phone TEXT,
        email TEXT,
        plot_id TEXT,
        plot_title TEXT,
        booking_amount REAL,
        total_price REAL,
        schedule TEXT,
        booked_on TEXT
      );
    `);
    console.log("✅ Booking DB Initialized");
  } catch (err) {
    console.error("❌ initBookingDB error:", err);
  }
};

export const saveBooking = async (booking) => {
  const {
    customer_name,
    phone,
    email,
    plot_id,
    plot_title,
    booking_amount,
    total_price,
    schedule
  } = booking;

  const booked_on = new Date().toISOString();

  try {
    await db.run(
      `INSERT INTO bookings 
        (customer_name, phone, email, plot_id, plot_title, booking_amount, total_price, schedule, booked_on)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, phone, email, plot_id, plot_title, booking_amount, total_price, schedule, booked_on]
    );
    console.log("✅ Booking saved locally");
  } catch (err) {
    console.error("❌ saveBooking error:", err);
  }
};
