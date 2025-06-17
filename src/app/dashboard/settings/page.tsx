export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your profile preferences here.
        </p>
      </div>
      
      {/* Placeholder content - can be expanded later */}
      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Account configuration options will be available here.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Notification Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage how you receive notifications and updates.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Privacy Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Control your privacy and data sharing preferences.
          </p>
        </div>
      </div>
    </div>
  );
}