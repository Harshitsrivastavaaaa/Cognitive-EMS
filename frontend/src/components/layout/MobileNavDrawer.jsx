import React from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import AkiyamLogo from "../../assets/logo.png";

/**
 * Slide-in navigation drawer for small screens.
 * Portaled to <body> because the headers use backdrop-filter, which would otherwise
 * make the header the containing block for these fixed-position elements.
 *
 * sections: [{ heading?: string, items: [{ path, label, icon, end? }] }]
 * hiddenAbove: Tailwind breakpoint prefix at which the drawer is no longer used ("lg" | "xl")
 */
export default function MobileNavDrawer({ open, onClose, brand, sections, linkClass, hiddenAbove = "lg" }) {
  const hiddenClass = hiddenAbove === "xl" ? "xl:hidden" : "lg:hidden";

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${hiddenClass} fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60]`}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
            className={`${hiddenClass} fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl z-[70] flex flex-col`}
            aria-label="Main"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <img src={AkiyamLogo} alt="Logo" className="w-8 h-8 object-contain" />
                {brand}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                aria-label="Close navigation menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
              {sections.map((section, i) => (
                <React.Fragment key={section.heading || i}>
                  {section.heading && (
                    <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {section.heading}
                    </p>
                  )}
                  {section.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) => `${linkClass(isActive)} text-sm py-2.5`}
                    >
                      <item.icon size={16} className="shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </React.Fragment>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
