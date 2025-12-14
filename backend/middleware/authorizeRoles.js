// Simple role-based authorization middleware
// Usage: router.get("/", authorizeRoles("Admin", "Manager"), handler)
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    console.log("authorizeRoles - Checking authorization:");
    console.log("  - User object:", req.user);
    console.log("  - Role from token:", role);
    console.log("  - Allowed roles:", allowedRoles);
    
    if (!role) {
      console.log("  - ❌ Role missing from token");
      return res.status(403).json({ message: "Role missing from token" });
    }

    // Case-insensitive role comparison
    const normalizedRole = typeof role === "string" ? role.trim() : String(role);
    const normalizedAllowedRoles = allowedRoles.map(r => 
      typeof r === "string" ? r.trim().toLowerCase() : String(r).toLowerCase()
    );

    const normalizedRoleLower = normalizedRole.toLowerCase();
    console.log("  - Normalized role:", normalizedRoleLower);
    console.log("  - Normalized allowed roles:", normalizedAllowedRoles);
    console.log("  - Role in allowed list?", normalizedAllowedRoles.includes(normalizedRoleLower));

    if (!normalizedAllowedRoles.includes(normalizedRoleLower)) {
      console.log("  - ❌ Access denied - role mismatch");
      return res.status(403).json({ 
        message: "Forbidden: insufficient role",
        details: `Required roles: ${allowedRoles.join(", ")}, Your role: ${role}`,
        debug: {
          roleFromToken: role,
          normalizedRole: normalizedRoleLower,
          allowedRoles: allowedRoles,
          normalizedAllowedRoles: normalizedAllowedRoles
        }
      });
    }

    console.log("  - ✅ Access granted");
    next();
  };
};

