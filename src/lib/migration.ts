// /**
//  * Migration utility to transition from localStorage to secure cookie storage
//  * This ensures existing users don't lose their authentication state
//  */

// import { tokenCookies } from "./cookies";

// /**
//  * Migrate authentication data from localStorage to secure storage
//  * This should be called once during app initialization
//  */
// export function migrateAuthData(): void {
//   try {
//     // Check if we have data in localStorage
//     const oldToken = localStorage.getItem("wms_token");
//     const oldUser = localStorage.getItem("wms_user");

//     if (oldToken) {
//       // Migrate token to secure storage
//       tokenCookies.setToken(oldToken);
//       // Remove from localStorage
//       localStorage.removeItem("wms_token");
//       console.log("Migrated authentication token to secure storage");
//     }

//     if (oldUser) {
//       // Migrate user data to secure storage
//       tokenCookies.setUser(oldUser);
//       // Remove from localStorage
//       localStorage.removeItem("wms_user");
//       console.log("Migrated user data to secure storage");
//     }
//   } catch (error) {
//     console.error("Error during auth data migration:", error);
//   }
// }

// /**
//  * Clean up any remaining localStorage auth data
//  */
// export function cleanupOldAuthData(): void {
//   try {
//     localStorage.removeItem("wms_token");
//     localStorage.removeItem("wms_user");
//   } catch (error) {
//     console.error("Error cleaning up old auth data:", error);
//   }
// }

// /**
//  * Check if migration is needed
//  */
// export function needsMigration(): boolean {
//   try {
//     return !!(
//       localStorage.getItem("wms_token") || localStorage.getItem("wms_user")
//     );
//   } catch {
//     return false;
//   }
// }
