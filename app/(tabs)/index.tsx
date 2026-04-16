// Version with branding

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/branding" />;
}

// import { Redirect } from "expo-router";

// const isLoggedIn = true;

// export default function Index() {
//   return isLoggedIn ? (
//     <Redirect href="/dashboard" />
//   ) : (
//     <Redirect href="/login" />
//   );
// }
