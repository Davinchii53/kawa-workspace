"use client";
export const runtime = "edge";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Seat } from "@/types";
import { supabase } from "@/lib/supabase";
import { signOut, isAdmin } from "@/lib/auth";
import FloorPlan from "@/components/floor/FloorPlan";
import BookingSidebar from "@/components/booking/BookingSidebar";
import LoginModal from "@/components/auth/LoginModal";

const NAV_ITEMS = ["Floor Plan", "Bookings", "Environment", "Profile"];

export default function Home() {
  const [seats, setSeats]           = useState<Seat[]>([]);
  const [selected, setSelected]     = useState<Seat | null>(null);
  const [booked, setBooked]         = useState(false);
  const [activeNav, setActiveNav]   = useState("Floor Plan");
  const [time, setTime]             = useState(new Date());
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState<User | null>(null);
  const [showLogin, setShowLogin]   = useState(false);

  const admin = isAdmin(user);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch seats
  useEffect(() => {
    async function fetchSeats() {
      const { data, error } = await supabase
        .from("seats")
        .select("*")
        .order("id");

      if (error) {
        console.error("Failed to fetch seats:", error.message);
        return;
      }

      setSeats(data as Seat[]);
      setLoading(false);
    }

    fetchSeats();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("seats-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seats" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setSeats(prev =>
              prev.map(s => s.id === (payload.new as Seat).id ? payload.new as Seat : s)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const available = seats.filter(s => s.status === "available").length;
  const occupied  = seats.filter(s => s.status === "occupied").length;
  const reserved  = seats.filter(s => s.status === "reserved").length;

  function handleSelect(seat: Seat) {
    if (!admin) return;
    setSelected(prev => prev?.id === seat.id ? null : seat);
    setBooked(false);
  }

  async function handleBook() {
    if (!selected || !admin) return;

    const { error } = await supabase
      .from("seats")
      .update({
        status:    "occupied",
        booked_at: new Date().toISOString(),
        booked_by: user?.id,
      })
      .eq("id", selected.id);

    if (error) {
      console.error("Booking failed:", error.message);
      return;
    }

    setSeats(prev => prev.map(s => s.id === selected.id ? { ...s, status:"occupied" } : s));
    setBooked(true);
    setTimeout(() => { setSelected(null); setBooked(false); }, 2000);
  }

  async function handleUnbook() {
    if (!selected || !admin) return;

    const { error } = await supabase
      .from("seats")
      .update({
        status:    "available",
        booked_at: null,
        booked_by: null,
      })
      .eq("id", selected.id);

    if (error) {
      console.error("Unbook failed:", error.message);
      return;
    }

    setSeats(prev => prev.map(s => s.id === selected.id ? { ...s, status:"available" } : s));
    setSelected(null);
  }

  async function handleReserve() {
    if (!selected || !admin) return;

    const { error } = await supabase
      .from("seats")
      .update({
        status:    "reserved",
        booked_at: new Date().toISOString(),
        booked_by: user?.id,
      })
      .eq("id", selected.id);

    if (error) {
      console.error("Reserve failed:", error.message);
      return;
    }

    setSeats(prev => prev.map(s => s.id === selected.id ? { ...s, status:"reserved" } : s));
    setSelected(null);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0F1E; color: #E8F4FD; font-family: 'Inter', sans-serif; }

        .kawa-nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #6B8FA8;
          background: none;
          border: none;
          cursor: pointer;
          padding: 7px 14px;
          border-radius: 8px;
          transition: all 0.15s ease;
          letter-spacing: 0.01em;
        }
        .kawa-nav-link:hover  { color: #E8F4FD; background: rgba(79,172,222,0.08); }
        .kawa-nav-link.active { color: #4FACDE; background: rgba(79,172,222,0.12); }

        .kawa-env-card {
          background:      rgba(13,31,60,0.5);
          border:          1px solid #1A3A5C;
          border-radius:   12px;
          padding:         18px 16px;
          backdrop-filter: blur(6px);
          transition:      border-color 0.15s ease;
        }
        .kawa-env-card:hover { border-color: rgba(79,172,222,0.3); }

        .kawa-loading {
          display:         flex;
          align-items:     center;
          justify-content: center;
          flex:            1;
          font-family:     'JetBrains Mono', monospace;
          font-size:       13px;
          color:           #4FACDE;
          letter-spacing:  0.1em;
          animation:       blink 1.2s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        .auth-btn {
          font-family:   'Inter', sans-serif;
          font-size:     12px;
          font-weight:   500;
          padding:       6px 14px;
          border-radius: 8px;
          cursor:        pointer;
          transition:    all 0.15s ease;
          border:        none;
          letter-spacing: 0.01em;
        }
        .auth-btn.login {
          background: rgba(79,172,222,0.12);
          color:      #4FACDE;
          border:     1px solid rgba(79,172,222,0.3);
        }
        .auth-btn.login:hover {
          background: rgba(79,172,222,0.2);
        }
        .auth-btn.logout {
          background: transparent;
          color:      #6B8FA8;
          border:     1px solid #1A3A5C;
        }
        .auth-btn.logout:hover {
          color:   #E8F4FD;
          border-color: #2A5A7C;
        }

        .admin-badge {
          font-family:    'JetBrains Mono', monospace;
          font-size:      9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color:          #4FACDE;
          background:     rgba(79,172,222,0.1);
          border:         1px solid rgba(79,172,222,0.2);
          border-radius:  4px;
          padding:        3px 7px;
        }
      `}</style>

      {showLogin && (
        <LoginModal
          onSuccess={() => setShowLogin(false)}
          onClose={() => setShowLogin(false)}
        />
      )}

      <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#E8F4FD", display:"flex", flexDirection:"column" }}>

        {/* NAV */}
        <nav style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "18px 36px",
          borderBottom:   "1px solid #1A3A5C",
          background:     "rgba(10,15,30,0.95)",
          backdropFilter: "blur(12px)",
          position:       "sticky",
          top:            0,
          zIndex:         100,
        }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"22px", fontWeight:700, letterSpacing:"-0.5px", color:"#E8F4FD" }}>
            kawa<span style={{ color:"#4FACDE" }}>.</span>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            {NAV_ITEMS.map(n => (
              <button
                key={n}
                className={`kawa-nav-link${activeNav === n ? " active" : ""}`}
                onClick={() => setActiveNav(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            {admin && <span className="admin-badge">admin</span>}
            {user ? (
              <button className="auth-btn logout" onClick={() => signOut()}>
                Sign out
              </button>
            ) : (
              <button className="auth-btn login" onClick={() => setShowLogin(true)}>
                Admin login
              </button>
            )}
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"13px", color:"#6B8FA8", letterSpacing:"0.05em" }}>
              {time.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div style={{
          padding:        "40px 36px 28px",
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "space-between",
          borderBottom:   "1px solid rgba(26,58,92,0.5)",
        }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"38px", fontWeight:600, letterSpacing:"-1px", lineHeight:1.1, color:"#E8F4FD" }}>
              Find your <span style={{ color:"#4FACDE" }}>flow.</span>
            </div>
            <div style={{ fontSize:"14px", color:"#6B8FA8", marginTop:"8px" }}>
              Bandung · Floor 2 · Live view
            </div>
          </div>
          <div style={{ display:"flex", gap:"32px", alignItems:"center" }}>
            {[
              { num: available,    label:"Available", color:"#4FACDE" },
              { num: occupied,     label:"Occupied",  color:"#E05A5A" },
              { num: reserved,     label:"Reserved",  color:"#C07A2A" },
              { num: seats.length, label:"Total",     color:"#4FACDE" },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{ display:"flex", alignItems:"center", gap:"32px" }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"28px", fontWeight:500, color:stat.color, lineHeight:1 }}>
                    {loading ? "—" : stat.num}
                  </div>
                  <div style={{ fontSize:"11px", color:"#6B8FA8", marginTop:"4px", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                    {stat.label}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width:"1px", height:"36px", background:"#1A3A5C" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        {loading ? (
          <div className="kawa-loading">fetching seats...</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", flex:1 }}>
            <FloorPlan
              seats={seats}
              selected={selected}
              onSelect={handleSelect}
              isAdmin={admin}
            />
            <BookingSidebar
              selected={selected}
              onBook={handleBook}
              onUnbook={handleUnbook}
              onReserve={handleReserve}
              booked={booked}
              isAdmin={admin}
            />
          </div>
        )}

        {/* ENV STRIP */}
        <div style={{ padding:"28px 36px 32px", borderTop:"1px solid rgba(26,58,92,0.5)" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:"#4FACDE", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"16px" }}>
            // environment · zone a
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px" }}>
            {[
              { label:"Temperature", value:"22°C",  sub:"Zone A · Optimal", icon:"🌡" },
              { label:"Noise Level", value:"34 dB", sub:"Focus mode · Quiet", icon:"🔈" },
              { label:"Lighting",    value:"420 lx", sub:"Warm white · Auto", icon:"💡" },
              { label:"Occupancy",   value:`${seats.length ? Math.round((occupied/seats.length)*100) : 0}%`, sub:`${occupied} of ${seats.length} seats taken`, icon:"👥" },
            ].map(env => (
              <div key={env.label} className="kawa-env-card">
                <span style={{ fontSize:"18px", marginBottom:"10px", display:"block" }}>{env.icon}</span>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"20px", fontWeight:500, color:"#E8F4FD", lineHeight:1 }}>{env.value}</div>
                <div style={{ fontSize:"11px", color:"#6B8FA8", marginTop:"4px", textTransform:"uppercase", letterSpacing:"0.07em" }}>{env.label}</div>
                <div style={{ fontSize:"11px", color:"rgba(107,143,168,0.7)", marginTop:"6px" }}>{env.sub}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}