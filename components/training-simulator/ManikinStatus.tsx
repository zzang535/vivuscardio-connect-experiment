export default function ManikinStatus({ isPressed, isVentilating, depth, ventilationVolume }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-gray-800">
      <h3 className="text-xl font-bold text-gray-700 mb-6">Training Status</h3>
      <div className="text-base space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Compression:</span>
          <span className="font-semibold">{isPressed ? 'Active' : 'Idle'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Ventilation:</span>
          <span className="font-semibold">{isVentilating ? 'Active' : 'Idle'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Depth:</span>
          <span className="font-semibold">{depth}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Volume:</span>
          <span className="font-semibold">{ventilationVolume}%</span>
        </div>
      </div>
    </div>
  );
}
