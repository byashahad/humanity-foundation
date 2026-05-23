"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "./Context";
import {
    Menu,
    Home,
    Megaphone,
    Heart,
    MailCheck,
    MessageCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    PlusIcon,
    UserLock,
    Image,

} from "lucide-react";
import { useEffect, useState, useRef } from "react";

const Sidebar = () => {
    // 🔹 STATE MANAGEMENT
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false); // 🔴 STEP 2: Loading state
    const sidebarRef = useRef(null);
    const pathname = usePathname();
    const router = useRouter(); // 🔴 STEP 3: Router initialize
    const { adminSidebarOpen, setAdminSidebarOpen } = useAppContext();

    // 🔹 CHECK IF CURRENT PAGE IS ADMIN PAGE
    const isAdminPage = pathname?.startsWith("/admin");

    // 🔹 NAVIGATION ITEMS
    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: <Home size={20} /> },
        { name: "Campaigns", href: "/admin/campaigning/campaigns", icon: <Megaphone size={20} /> },
        { name: "Campaigns-create", href: "/admin/campaigning/create", icon: <PlusIcon size={20} /> },
        { name: "Subscribers", href: "/admin/campaigning/subscribers", icon: <MailCheck size={20} /> },
        { name: "Contact Queries", href: "/admin/campaigning/query", icon: <MessageCircle size={20} /> },
        { name: "Home Banner", href: "/admin/campaigning/homebanner", icon: <Image size={20} /> },
    ];

    // 🔴 STEP 4: HANDLE LOGOUT FUNCTION - Yahi tera main code hai!
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true); // Loading start

            // API call to your existing endpoint
            const response = await fetch("/api/admin-logout", {
                method: "POST",
                credentials: "include", // ✅ Cookie bhejna mat bhoolna
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data.success) {
                // ✅ Success - redirect to login
                router.push("/admin-login");
                router.refresh(); // ✅ Cache clear

                // Mobile sidebar band kar do agar khula ho
                setIsMobileOpen(false);
                setAdminSidebarOpen?.(false);
            } else {
                // ❌ API error
                alert(data.message || "Logout failed. Please try again.");
                setIsLoggingOut(false);
            }
        } catch (error) {
            // ❌ Network error
            console.error("Logout error:", error);
            alert("Network error. Please check your connection.");
            setIsLoggingOut(false);
        }
    };

    // 🔹 CLOSE MOBILE SIDEBAR WHEN CLICKING OUTSIDE
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsMobileOpen(false);
                setAdminSidebarOpen?.(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobileOpen, setAdminSidebarOpen]);

    // 🔹 FETCH USER DATA
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch("/api/me", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.loggedIn) {
                        setUserData(data.user || { name: "Admin User" });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        if (isAdminPage) fetchUserData();
    }, [isAdminPage]);

    // 🔹 TOGGLE FUNCTIONS
    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setIsMobileOpen(!isMobileOpen);
            setAdminSidebarOpen?.(!isMobileOpen);
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    const closeMobile = () => {
        setIsMobileOpen(false);
        setAdminSidebarOpen?.(false);
    };

    // 🔹 HELPER FUNCTIONS
    const isActive = (href) => pathname === href;

    // 🔹 DON'T RENDER ON NON-ADMIN PAGES
    if (!isAdminPage) return null;

    // Determine sidebar state
    const isDesktopCollapsed = !isExpanded && !isMobileOpen;
    const sidebarWidth = isDesktopCollapsed ? "w-[80px]" : "w-[260px]";

    return (
        <>
            {/* MOBILE MENU BUTTON */}
            <button
                onClick={toggleSidebar}
                className="fixed top-2 left-3 lg:hidden z-50 p-2.5 bg-white/80 backdrop-blur-md border border-gray-200/80 text-gray-700 rounded-2xl shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Toggle menu"
                aria-expanded={isMobileOpen}
            >
                <UserLock size={22} />
            </button>

            {/* MOBILE OVERLAY */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}

            {/* SIDEBAR - APPLE STYLE GLASSMORPHISM */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed top-0 left-0 h-screen z-50
                    flex flex-col
                    bg-white/80 backdrop-blur-xl backdrop-saturate-150
                    border-r border-gray-200/50
                    shadow-[0_8px_32px_rgba(0,0,0,0.06)]
                    rounded-2xl lg:rounded-none lg:rounded-r-2xl
                    transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${sidebarWidth}
                `}
                aria-label="Admin navigation"
            >
                {/* HEADER WITH LOGO & TOGGLE */}
                <div className={`
                    flex items-center h-20 px-5 border-b border-gray-200/50
                    ${isDesktopCollapsed ? "justify-center" : "justify-between"}
                `}>
                    {/* LOGO - ONLY SHOW WHEN EXPANDED */}
                    {!isDesktopCollapsed && (
                        <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200/50">
                                <span className="font-semibold text-white text-lg">A</span>
                            </div>
                            <div>
                                <h1 className="font-semibold text-gray-800 text-base tracking-tight">AdminPro</h1>
                                <p className="text-[11px] text-gray-500">Dashboard</p>
                            </div>
                        </div>
                    )}

                    {/* TOGGLE BUTTON */}
                    <button
                        onClick={toggleSidebar}
                        className={`
                            hidden lg:flex items-center justify-center
                            w-8 h-8 rounded-xl
                            text-gray-500 hover:text-blue-600
                            bg-gray-50/80 hover:bg-blue-50
                            border border-gray-200/50 hover:border-blue-200
                            transition-all duration-200 hover:scale-110
                        `}
                        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                {/* USER PROFILE SECTION */}
                <div className={`
                    px-4 py-5 border-b border-gray-200/50
                    ${isDesktopCollapsed ? "flex justify-center" : ""}
                `}>
                    <div className={`
                        flex items-center gap-3
                        ${isDesktopCollapsed ? "flex-col" : ""}
                    `}>
                        {/* AVATAR WITH STATUS */}
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm ring-2 ring-white/50">
                                {userData?.avatar ? (
                                    <img src={userData.avatar} alt="Admin" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User size={20} className="text-white" />
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        </div>

                        {/* USER INFO */}
                        {!isDesktopCollapsed && (
                            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                <h3 className="font-medium text-gray-800 text-sm truncate">
                                    {userData?.name || "Alex Morgan"}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">Administrator</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 overflow-y-auto py-6 px-3" aria-label="Main navigation">
                    <div className="space-y-1.5">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        transition-all duration-200 ease-out
                                        ${active
                                            ? "bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-200/50"
                                            : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                                        }
                                        ${isDesktopCollapsed ? "justify-center" : ""}
                                    `}
                                    aria-current={active ? "page" : undefined}
                                >
                                    {/* LEFT BORDER INDICATOR */}
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                                    )}

                                    {/* ICON */}
                                    <span className={`
                                        flex-shrink-0 transition-transform duration-200 group-hover:scale-110
                                        ${active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}
                                    `}>
                                        {item.icon}
                                    </span>

                                    {/* TEXT */}
                                    {!isDesktopCollapsed && (
                                        <span className="font-medium text-sm transition-all duration-200 animate-in fade-in">
                                            {item.name}
                                        </span>
                                    )}

                                    {/* TOOLTIP */}
                                    {isDesktopCollapsed && (
                                        <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                                            {item.name}
                                        </span>
                                    )}

                                    {/* ACTIVE GLOW */}
                                    {active && (
                                        <span className="absolute inset-0 rounded-xl bg-blue-400/5 animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* 🔴 STEP 5: LOGOUT BUTTON WITH FULL HANDLER - YE DEKH BHAI PYAAR SA! */}
                <div className="p-4 border-t border-gray-200/50">
                    <button
                        onClick={handleLogout}  // 🔴 Yahan click handler laga diya
                        disabled={isLoggingOut} // 🔴 Loading state me disable kar diya
                        className={`
                            group relative flex items-center gap-3 w-full
                            ${isDesktopCollapsed ? "justify-center" : "justify-start"}
                            px-3 py-2.5 rounded-xl
                            transition-all duration-200
                            ${isLoggingOut
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-red-50/80 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-100/50 hover:border-red-200"
                            }
                        `}
                        aria-label="Logout"
                    >
                        {/* 🔴 ANIMATED ICON - Loading state me spin */}
                        <LogOut
                            size={18}
                            className={`
                                transition-all duration-200
                                ${isLoggingOut
                                    ? "animate-spin"
                                    : "group-hover:scale-110"
                                }
                            `}
                        />

                        {/* 🔴 BUTTON TEXT - Loading state me change */}
                        {!isDesktopCollapsed && (
                            <span className="font-medium text-sm transition-all animate-in fade-in">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </span>
                        )}

                        {/* 🔴 TOOLTIP WHEN COLLAPSED */}
                        {isDesktopCollapsed && (
                            <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT PADDING */}
            <div className={`
                transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                ${isExpanded && !isMobileOpen ? "lg:pl-[260px]" : "lg:pl-[80px]"}
            `} />
        </>
    );
};

export default Sidebar;