"use client";

import { Seat } from "@/types";

interface DeskNodeProps {
  seat: Seat;
  selected: boolean;
  onClick: (seat: Seat) => void;
  isAdmin: boolean;
}

const statusColor = (status: string) => {
  if (status === "available") return "#4FACDE";
  if (status === "occupied")  return "#E05A5A";
  if (status === "reserved")  return "#C07A2A";
  return "#4FACDE";
};

const statusGlow = (status: string) => {
  if (status === "available") return "0 0 10px rgba(79,172,222,0.6), 0 0 20px rgba(79,172,222,0.2)";
  if (status === "occupied")  return "0 0 8px rgba(224,90,90,0.5)";
  if (status === "reserved")  return "0 0 8px rgba(192,122,42,0.5)";
  return "none";
};

export default function DeskNode({ seat, selected, onClick, isAdmin }: DeskNodeProps) {
  const isOccupied = seat.status === "occupied";
  const isReserved = seat.status === "reserved";
  const isPod      = seat.type === "pod";
  const isBlocked  = (isOccupied || isReserved) && !isAdmin;

  function handleClick() {
    if (isBlocked) return;
    onClick(seat);
  }

  return (
    <div
      onClick={handleClick}
      style={{
        background:      `${statusColor(seat.status)}18`,
        boxShadow:       selected
          ? `0 0 0 2px #E8F4FD, ${statusGlow(seat.status)}`
          : statusGlow(seat.status),
        borderTop:       `1.5px solid ${statusColor(seat.status)}60`,
        borderRight:     `1.5px solid ${statusColor(seat.status)}60`,
        borderBottom:    `1.5px solid ${statusColor(seat.status)}60`,
        borderLeft:      `1.5px solid ${statusColor(seat.status)}60`,
        borderRadius:    isPod ? "50%" : "10px",
        opacity:         isBlocked ? 0.7 : 1,
        cursor:          isBlocked ? "not-allowed" : "pointer",
        aspectRatio:     "1",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        transition:      "transform 0.12s ease, box-shadow 0.12s ease",
        animation:       seat.status === "available"
          ? "pulse-available 2.5s ease-in-out infinite"
          : "pulse-occupied 3s ease-in-out infinite",
      }}
      className={selected ? "scale-110" : isOccupied ? "" : "hover:scale-105"}
    >
      <span style={{
        fontFamily:    "'JetBrains Mono', monospace",
        fontSize:      "9px",
        fontWeight:    500,
        color:         "rgba(232,244,253,0.9)",
        letterSpacing: "0.05em",
      }}>
        {seat.id}
      </span>
    </div>
  );
}