"use client";

import { Seat } from "@/types";

interface BookingSidebarProps {
  selected:  Seat | null;
  onBook:    () => void;
  onUnbook:  () => void;
  onReserve: () => void;
  booked:    boolean;
  isAdmin:   boolean;
}

export default function BookingSidebar({ selected, onBook, onUnbook, onReserve, booked, isAdmin }: BookingSidebarProps) {
  return (
    <div style={{ padding:"32px 24px", display:"flex", flexDirection:"column", gap:"24px" }}>

      {/* Booking panel */}
      <div style={{ background:"rgba(13,31,60,0.6)", border:"1px solid #1A3A5C", borderRadius:"14px", padding:"20px", backdropFilter:"blur(8px)" }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"15px", fontWeight:600, color:"#E8F4FD", marginBottom:"14px" }}>
          {isAdmin ? "Seat control" : "Seat status"}
        </div>

        {!selected ? (
          <div style={{ fontSize:"13px", color:"#6B8FA8", lineHeight:1.5 }}>
            {isAdmin
              ? "Select any seat on the floor plan to manage it."
              : "Select a seat to view its status."}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"24px", fontWeight:500, color:"#4FACDE" }}>
                {selected.id}
              </div>
              <div style={{ fontSize:"12px", color:"#6B8FA8", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {selected.type === "pod" ? "Private pod" : "Open desk"}
              </div>
            </div>

            <div style={{ fontSize:"12px", color:"#6B8FA8", lineHeight:1.5 }}>
              Zone {selected.zone} · Floor 2<br />
              Status: <span style={{ color: selected.status === "available" ? "#4FACDE" : selected.status === "occupied" ? "#E05A5A" : "#C07A2A" }}>
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </span>
            </div>

            {isAdmin && (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginTop:"4px" }}>
                {selected.status === "available" && (
                  <>
                    <button
                      onClick={onBook}
                      disabled={booked}
                      style={{
                        width:"100%", padding:"11px",
                        background: booked ? "#2A7A4A" : "#4FACDE",
                        color: booked ? "#A8F0C0" : "#0A0F1E",
                        border:"none", borderRadius:"10px",
                        fontFamily:"'Space Grotesk',sans-serif",
                        fontSize:"13px", fontWeight:600,
                        cursor: booked ? "default" : "pointer",
                        transition:"background 0.15s ease",
                      }}
                    >
                      {booked ? "Booked ✓" : `Book ${selected.id}`}
                    </button>
                    <button
                      onClick={onReserve}
                      style={{
                        width:"100%", padding:"11px",
                        background:"transparent",
                        color:"#C07A2A",
                        border:"1px solid rgba(192,122,42,0.4)",
                        borderRadius:"10px",
                        fontFamily:"'Space Grotesk',sans-serif",
                        fontSize:"13px", fontWeight:500,
                        cursor:"pointer",
                        transition:"all 0.15s ease",
                      }}
                    >
                      Reserve {selected.id}
                    </button>
                  </>
                )}

                {(selected.status === "occupied" || selected.status === "reserved") && (
                  <button
                    onClick={onUnbook}
                    style={{
                      width:"100%", padding:"11px",
                      background:"transparent",
                      color:"#E05A5A",
                      border:"1px solid rgba(224,90,90,0.4)",
                      borderRadius:"10px",
                      fontFamily:"'Space Grotesk',sans-serif",
                      fontSize:"13px", fontWeight:500,
                      cursor:"pointer",
                      transition:"all 0.15s ease",
                    }}
                  >
                    Unbook {selected.id}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Today's stats */}
      <div style={{ background:"rgba(13,31,60,0.4)", border:"1px solid #1A3A5C", borderRadius:"14px", padding:"20px" }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:"#4FACDE", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px" }}>
          // today
        </div>
        {[
          { label:"Your bookings", val: isAdmin ? "admin" : "—" },
          { label:"Hours logged",  val:"0h" },
          { label:"Favorite zone", val:"—" },
        ].map(item => (
          <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(26,58,92,0.4)" }}>
            <span style={{ fontSize:"12px", color:"#6B8FA8" }}>{item.label}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"13px", color:"#E8F4FD" }}>{item.val}</span>
          </div>
        ))}
      </div>

    </div>
  );
}