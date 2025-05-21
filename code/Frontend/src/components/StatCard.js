const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-brown/20">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-brown">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard