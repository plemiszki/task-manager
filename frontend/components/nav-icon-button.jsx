import React from "react";

export default function NavIconButton({
  href,
  icon: Icon,
  activePath,
  dataMethod,
}) {
  const isActive = activePath && window.location.pathname === activePath;
  return (
    <a
      rel="nofollow"
      href={href}
      data-method={dataMethod}
      style={{ display: "inline-flex" }}
    >
      <Icon style={{ fontSize: 30, color: isActive ? "red" : "#333" }} />
    </a>
  );
}
