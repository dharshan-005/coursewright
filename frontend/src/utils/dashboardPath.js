export function dashboardPathForRole(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "instructor":
      return "/instructor";
    case "student":
    default:
      return "/dashboard";
  }
}
