import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white text-center py-3 border-top">
      <small>
        © {new Date().getFullYear()} NPHCDA Archive Document & Sharing System.
        All Rights Reserved.
      </small>
    </footer>
  );
};

export default Footer;
