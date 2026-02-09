export function scopeToUser(user: Express.User): { userId?: string; brandId?: string | null } {
  switch (user.role) {
    case "franchisee":
      return { userId: user.id };
    case "franchisor":
      return { brandId: user.brandId };
    case "katalyst_admin":
      return {};
  }
}

export function projectForRole(user: Express.User): { level: "own" | "brand" | "all" } {
  switch (user.role) {
    case "franchisee":
      return { level: "own" };
    case "franchisor":
      return { level: "brand" };
    case "katalyst_admin":
      return { level: "all" };
  }
}
