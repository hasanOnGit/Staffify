import StaffifyLogo from "../components/StaffifyLogo";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-[#F4F5F7]">
      {/* Left Enterprise Branding Section */}
      <div className="hidden lg:flex w-1/2 bg-[#0747A6] text-white px-16 py-12 flex-col justify-between">
        {/* Top Content */}
        <div>
          <StaffifyLogo size="lg" textLight={true} subtitle="Enterprise" className="mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            Workforce Intelligence & HR Platform
          </p>

          <p className="mt-8 text-2xl font-semibold text-white leading-snug">
            Enterprise People Operations & Workforce Management
          </p>

          <div className="mt-6 w-12 h-1 bg-[#4C9AFF] rounded"></div>

          <p className="mt-6 text-sm text-blue-100 max-w-md leading-relaxed">
            Staffify delivers enterprise-grade HR operations, attendance tracking,
            leave policies, and employee self-service matching Indian statutory
            standards.
          </p>
        </div>

        {/* Bottom Footer */}
        <div>
          <p className="text-xs text-blue-200">
            © {new Date().getFullYear()} Staffify HRMS. All rights reserved.
          </p>
          <p className="text-xs text-blue-300 mt-0.5">
            Enterprise Security & Compliance
          </p>
        </div>
      </div>

      {/* Right Form Card Section */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-white rounded border border-[#DFE1E6] p-8 shadow-xs">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
