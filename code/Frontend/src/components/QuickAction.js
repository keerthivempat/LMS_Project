import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const QuickAction = ({ icon: Icon, title, description, to, color }) => (
  <Link to={to} className="block">
    <div className="bg-white p-6 rounded-lg shadow-sm border border-brown/20 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brown">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

export default QuickAction;