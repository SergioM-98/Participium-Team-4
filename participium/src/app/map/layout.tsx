import WithNavbarLayout from "@/app/(with-navbar)/layout";

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No session check here - accessible to public
  return <WithNavbarLayout>{children}</WithNavbarLayout>;
}
