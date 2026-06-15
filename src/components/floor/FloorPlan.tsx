"use client";

import { Seat } from "@/types";
import DeskNode from "./DeskNode";

interface FloorPlanProps {
  seats: Seat[];
  selected: Seat | null;
  onSelect: (seat: Seat) => void;
  isAdmin: boolean;
}

const ZONE_LABELS: Record<string, string> = {
  A: "Zone A — Open Desks",
  B: "Zone B — Open Desks",
  C: "Zone C — Open Desks",
  P: "Private Pods",
};

export default function FloorPlan({ seats, selected, onSelect, isAdmin }: FloorPlanProps) {
  const desks = seats.filter(s => s.type === "desk");
  const pods  = seats.filter(s => s.type === "pod");

  const zoneA = desks.filter(s => s.zone === "A");
  const zoneB = desks.filter(s => s.zone === "B");
  const zoneC = desks.filter(s => s.zone === "C");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes pulse-available {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.75; }
        }
        @keyframes pulse-occupied {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      <div style={{
        padding:     "32px 36px",
        borderRight: "1px solid #1A3A5C",
        display:     "flex",
        flexDirection: "column",
        gap:         "0",
      }}>
        {/* Section label */}
        <div style={{
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      "11px",
          color:         "#4FACDE",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom:  "20px",
        }}>
          // live floor plan
        </div>

        {/* Grid */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gridTemplateRows:    "repeat(5, auto)",
          gap:                 "12px",
          background:          "rgba(13,31,60,0.4)",
          border:              "1px solid #1A3A5C",
          borderRadius:        "16px",
          padding:             "28px",
          position:            "relative",
        }}>
          {/* Dot grid background */}
          <div style={{
            position:        "absolute",
            inset:           0,
            borderRadius:    "16px",
            backgroundImage: `
              linear-gradient(rgba(79,172,222,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(79,172,222,0.04) 1px, transparent 1px)
            `,
            backgroundSize:  "40px 40px",
            pointerEvents:   "none",
          }} />

          {/* Zone A label */}
          <div style={{ gridColumn:"1/5", gridRow:"1/2", display:"flex", alignItems:"center", paddingBottom:"4px" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"rgba(107,143,168,0.45)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
              {ZONE_LABELS["A"]}
            </span>
          </div>

          {/* Divider */}
          <div style={{ gridColumn:"5/6", gridRow:"1/6", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:"1px", height:"80%", background:"rgba(26,58,92,0.6)", margin:"0 auto" }} />
          </div>

          {/* Pod label */}
          <div style={{ gridColumn:"6/9", gridRow:"1/2", display:"flex", alignItems:"center", paddingBottom:"4px" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"rgba(107,143,168,0.45)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
              {ZONE_LABELS["P"]}
            </span>
          </div>

          {/* Zone A desks */}
          {zoneA.map((seat, i) => (
            <div key={seat.id} style={{ gridColumn:`${i+1}/${i+2}`, gridRow:"2/3" }}>
              <DeskNode
  seat={seat}
  selected={selected?.id === seat.id}
  onClick={onSelect}
  isAdmin={isAdmin}
/>
            </div>
          ))}

          {/* Zone B label */}
          <div style={{ gridColumn:"1/5", gridRow:"3/4", display:"flex", alignItems:"center", padding:"8px 0 4px" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"rgba(107,143,168,0.45)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
              {ZONE_LABELS["B"]}
            </span>
          </div>

          {/* Zone B desks */}
          {zoneB.map((seat, i) => (
            <div key={seat.id} style={{ gridColumn:`${i+1}/${i+2}`, gridRow:"4/5" }}>
              <DeskNode seat={seat} selected={selected?.id === seat.id} onClick={onSelect} isAdmin={isAdmin} />
            </div>
          ))}

          {/* Zone C label */}
          <div style={{ gridColumn:"1/5", gridRow:"5/6", display:"flex", alignItems:"center", padding:"8px 0 4px" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"rgba(107,143,168,0.45)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
              {ZONE_LABELS["C"]}
            </span>
          </div>

          {/* Zone C desks — needs row 6 */}
          <style>{`.zone-c-row { grid-row: 6/7 !important; }`}</style>
          {zoneC.map((seat, i) => (
            <div key={seat.id} style={{ gridColumn:`${i+1}/${i+2}` }} className="zone-c-row">
              <DeskNode seat={seat} selected={selected?.id === seat.id} onClick={onSelect} isAdmin={isAdmin} />
            </div>
          ))}

          {/* Pods */}
          {pods.map((seat, i) => (
            <div key={seat.id} style={{ gridColumn:"7/8", gridRow:`${i+2}/${i+3}` }}>
              <DeskNode seat={seat} selected={selected?.id === seat.id} onClick={onSelect} isAdmin={isAdmin} />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:"20px", marginTop:"16px", alignItems:"center" }}>
          {[
            ["#4FACDE", "Available", "0 0 6px rgba(79,172,222,0.7)"],
            ["#E05A5A", "Occupied",  "none"],
            ["#C07A2A", "Reserved",  "none"],
          ].map(([color, label, glow]) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"11px", color:"#6B8FA8" }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:color, boxShadow:glow }} />
              {label}
            </div>
          ))}
          <div style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"rgba(107,143,168,0.5)" }}>
            ○ pods · □ desks
          </div>
        </div>
      </div>
    </>
  );
}