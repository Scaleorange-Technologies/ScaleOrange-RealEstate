    export const MyBookingsScreen = ({ setCurrentScreen }) => {
        // Hardcoded bookings data
        const bookings = [
            {
                plotId: "SO001",
                title: "Premium Villa Plot - Gachibowli",
                location: "Gachibowli, Hyderabad",
                tokenAmount: 850000,
                status: "Confirmed",
                date: "2025-07-01",
            },
            {
                plotId: "SO005",
                title: "Industrial Plot - Near Siddipet Projects",
                location: "Siddipet, Telangana",
                tokenAmount: 1500000,
                status: "Pending",
                date: "2025-07-10",
            },
        ];

        return (
            <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee" }}>
                <button
                    onClick={() => setCurrentScreen("maps")}
                    style={{ background: "none", border: "none", color: "#9C27B0", fontWeight: "bold", fontSize: 18, marginBottom: 12, cursor: "pointer" }}
                >
                    ← Back to Map
                </button>
                <h2 style={{ color: "#9C27B0" }}>🗒️ My Bookings</h2>
                {bookings.length === 0 ? (
                    <div style={{ marginTop: 40, color: "#888", textAlign: "center" }}>You have no plot bookings yet.</div>
                ) : (
                    <div style={{ marginTop: 24 }}>
                        {bookings.map((b, i) => (
                            <div key={i} style={{ border: "1px solid #eee", borderRadius: 8, padding: 18, marginBottom: 18 }}>
                                <div style={{ fontWeight: "bold", fontSize: 16 }}>{b.title}</div>
                                <div style={{ color: "#666", fontSize: 14, margin: "6px 0" }}>📍 {b.location}</div>
                                <div style={{ fontSize: 13, color: "#444" }}>Booking Date: {b.date}</div>
                                <div style={{ fontSize: 13, color: "#444" }}>
                                    Token Amount: <span style={{ color: "#FF5722", fontWeight: "bold" }}>₹{(b.tokenAmount / 100000).toFixed(1)}L</span>
                                </div>
                                <div style={{ fontSize: 13, color: b.status === "Confirmed" ? "#4caf50" : "#ff9800", fontWeight: "bold", marginTop: 6 }}>
                                    Status: {b.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };