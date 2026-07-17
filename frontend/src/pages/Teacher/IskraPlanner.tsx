import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserId } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * IskraPlanner - AI-powered lesson plan generator
 * Component for generating, viewing and managing lesson plans with Groq AI
 */

export const IskraPlanner = () => {
  const navigate = useNavigate();
  const { userID } = useUserId();
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [coins, setCoins] = useState(null);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    topic: '',
    grade: '2',
    schoolType: 'gimnazija',
    classType: 'teorija',
    duration: 45,
    language: 'python'
  });

  // Fetch user coins on mount
  useEffect(() => {
    if (userID) {
      fetchCoins();
    }
  }, [userID]);

  const fetchCoins = async () => {
    try {
      const response = await fetch(`/api/plans/coins/balance?userId=${userID}`);
      if (response.ok) {
        const data = await response.json();
        setCoins(data.coins);
      }
    } catch (err) {
      console.error('Error fetching coins:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedPlan(null);

    try {
      // Validate topic
      if (!formData.topic.trim()) {
        throw new Error('Molimo unesite temu časa.');
      }

      console.log('📤 Sending request to /api/ai/generate-plan');
      console.log('📋 Form data:', formData);

      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: userID // Add user ID
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error types
        if (response.status === 402) {
          throw new Error(
            `Nemate dovoljno kredita. Potrebno: ${data.required}, dostupno: ${data.available}. Krediti se resetuju svakih sat vremena.`
          );
        }
        throw new Error(data.error || 'Greška pri generisanju plana.');
      }

      console.log('✅ Plan generated successfully');
      setGeneratedPlan(data.plan);
      setCoins(data.userCoins);

      // Show success message and redirect to plan viewer
      alert(`✅ Plan je uspešno generisan!\n💰 Koštalo vas je ${data.costApplied} kredita.\nPreostaje: ${data.userCoins.current} kredita`);
      
      // Redirect to plan viewer after 1 second
      setTimeout(() => {
        if (data.plan && data.plan._id) {
          navigate(`/plan/${data.plan._id}`);
        }
      }, 1000);

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Greška pri generisanju plana.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPlan = () => {
    if (!generatedPlan) return;

    const element = document.createElement('a');
    const file = new Blob([generatedPlan.content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${generatedPlan.title}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getCoinPercentage = () => {
    if (!coins) return 0;
    return (coins.current / coins.limit) * 100;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🎓 IskraAI Planner</h1>
        <p className="text-gray-600">Kreirajte detaljne planove časa koristeći veštačku inteligenciju</p>
      </div>

      {/* Coin Status */}
      {coins && (
        <Card className="mb-8 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>💰 Vaši krediti</span>
              <span className={`text-2xl font-bold ${coins.current < 500 ? 'text-red-600' : 'text-orange-600'}`}>
                {coins.current} / {coins.limit}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  getCoinPercentage() < 20 ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(getCoinPercentage(), 100)}%` }}
              />
            </div>
            
            {coins.current < 500 && (
              <p className="text-sm text-red-600 font-semibold">
                ⚠️ Nemate dovoljno kredita! Generisanje plana zahteva minimum 1000 kredita.
              </p>
            )}
            
            {coins.current >= 500 && coins.current < 1000 && (
              <p className="text-sm text-amber-600 font-semibold">
                ⚠️ Imate malo kredita. Potrebno je 1000 kredita za generisanje plana.
              </p>
            )}
            
            {coins.current >= 1000 && (
              <p className="text-sm text-green-600">
                ✅ Možete generisati plan. Koštaće oko 1000 kredita.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - Left side */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Parametri časa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneratePlan} className="space-y-4">
                
                {/* Tema */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    📚 Tema časa <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    name="topic"
                    placeholder="npr. Nizovi i petlje u Python-u"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                {/* Razred */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    👥 Razred
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="1">1. razred</option>
                    <option value="2">2. razred</option>
                    <option value="3">3. razred</option>
                    <option value="4">4. razred</option>
                  </select>
                </div>

                {/* Tip škole */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    🏫 Tip škole
                  </label>
                  <select
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="gimnazija">Gimnazija</option>
                    <option value="tehnička">Tehnička škola</option>
                    <option value="strukovna">Strukovna škola</option>
                  </select>
                </div>

                {/* Tip časa */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    📖 Tip časa
                  </label>
                  <select
                    name="classType"
                    value={formData.classType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="teorija">Teorija</option>
                    <option value="praksa">Praksa</option>
                    <option value="kombinovano">Kombinovano</option>
                  </select>
                </div>

                {/* Trajanje */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    ⏱️ Trajanje (minuti)
                  </label>
                  <Input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="15"
                    max="180"
                    className="w-full"
                  />
                </div>

                {/* Jezik */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    💻 Programski jezik
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="csharp">C#</option>
                    <option value="java">Java</option>
                    <option value="ruby">Ruby</option>
                  </select>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-100 border border-red-400 rounded-md text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Generate button */}
                <Button
                  type="submit"
                  disabled={loading || !coins || coins.current < 1000}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader size={16} />
                      Generiši plan...
                    </div>
                  ) : (
                    '🤖 Generiši plan sa AI'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Generated Plan - Right side */}
        <div className="lg:col-span-2">
          {!generatedPlan && !loading && (
            <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
              <CardContent className="pt-8 text-center">
                <p className="text-gray-500 text-lg">
                  📝 Generisani plan će se prikazati ovde...
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="pt-8">
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <Loader size={48} />
                  <p className="text-lg font-semibold text-gray-700">
                    🤖 IskraAI generiše plan...
                  </p>
                  <p className="text-sm text-gray-500">
                    Ovo može potrajati 30-60 sekundi...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{generatedPlan.title}</span>
                  <Button
                    onClick={handleDownloadPlan}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    📥 Preuzmi
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedPlan.content}
                  </ReactMarkdown>
                </div>
                
                {/* Metadata */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-600 font-semibold">📊 Dužina</p>
                    <p className="text-blue-800">{generatedPlan.content.length} karaktera</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-600 font-semibold">⏰ Generisano</p>
                    <p className="text-green-800">{new Date(generatedPlan.createdAt).toLocaleString('sr-RS')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Additional info */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">ℹ️ Kako koristiti IskraAI Planner?</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2 text-sm">
          <p>1️⃣ <strong>Unesite temu časa</strong> - npr. "Nizovi i petlje u Python-u"</p>
          <p>2️⃣ <strong>Odaberite parametre</strong> - razred, tip škole, trajanje, itd.</p>
          <p>3️⃣ <strong>Kliknite "Generiši plan"</strong> - IskraAI će kreirati detaljan plan</p>
          <p>4️⃣ <strong>Pregledajte i preuzmite</strong> - Plan će biti dostupan za preuzimanje kao Markdown</p>
          <p>💡 <strong>Napomena:</strong> Svaki plan generiše IskraAI troši 1000 kredita. Krediti se automatski resetuju svakih sat vremena.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IskraPlanner;
