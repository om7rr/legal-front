import { redirect } from "next/navigation";

export default function Home() {
  // The cases page redirects to /login when there's no token.
  redirect("/cases");
}
