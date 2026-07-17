import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from '@/components/custom/Loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * PlanViewer - View generated lesson plan
 */
export const PlanViewer = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/planner/plan/${planId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Plan nije pronađen.');
        }
        throw new Error('Greška pri učitavanju plana.');
      }

      const data = await response.json();
      setPlan(data.plan || data);
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPlan = () => {
    if (!plan) return;

    const element = document.createElement('a');
    const file = new Blob([plan.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${plan.title.replace(/[/\\?%*:|"<>]/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintPlan = () => {
    window.print();
  };

  const handleBackToPlanner = () => {
    navigate('/planner');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader size={48} />
          <p className="text-lg font-semibold text-gray-700">Učitavanje plana...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 font-semibold mb-4">❌ {error}</p>
            <Button onClick={handleBackToPlanner} className="bg-red-600 hover:bg-red-700">
              ← Nazad na planner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">Plan nije pronađen.</p>
            <Button onClick={handleBackToPlanner} className="mt-4">
              ← Nazad na planner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{plan.title}</h1>
            {plan.metadata && (
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {plan.metadata.grade && <span>📚 Razred: {plan.metadata.grade}</span>}
                {plan.metadata.schoolType && <span>🏫 {plan.metadata.schoolType}</span>}
                {plan.metadata.duration && <span>⏱️ {plan.metadata.duration} min</span>}
                {plan.metadata.language && <span>💻 {plan.metadata.language}</span>}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadPlan}
              className="bg-green-600 hover:bg-green-700"
              title="Preuzmi plan kao Markdown"
            >
              📥 Preuzmi
            </Button>
            <Button
              onClick={handlePrintPlan}
              className="bg-blue-600 hover:bg-blue-700"
              title="Štampaj plan"
            >
              🖨️ Štampa
            </Button>
            <Button
              onClick={handleBackToPlanner}
              className="bg-gray-600 hover:bg-gray-700"
              title="Nazad na planner"
            >
              ← Nazad
            </Button>
          </div>
        </div>
      </div>

      {/* Plan Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {plan.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      {plan.metadata && (
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">📊 Informacije o planu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {plan.metadata.grade && (
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-gray-600">Razred</p>
                  <p className="font-bold text-gray-800">{plan.metadata.grade}. razred</p>
                </div>
              )}
              {plan.metadata.schoolType && (
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-gray-600">Tip škole</p>
                  <p className="font-bold text-gray-800">{plan.metadata.schoolType}</p>
                </div>
              )}
              {plan.metadata.duration && (
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-gray-600">Trajanje</p>
                  <p className="font-bold text-gray-800">{plan.metadata.duration} min</p>
                </div>
              )}
              {plan.metadata.language && (
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-gray-600">Jezik</p>
                  <p className="font-bold text-gray-800">{plan.metadata.language}</p>
                </div>
              )}
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-gray-600">Dužina</p>
                <p className="font-bold text-gray-800">{plan.content.length} char</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-gray-600">Kreirano</p>
                <p className="font-bold text-gray-800">
                  {new Date(plan.createdAt).toLocaleDateString('sr-RS')}
                </p>
              </div>
              {plan.metadata.aiModel && (
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-gray-600">AI Model</p>
                  <p className="font-bold text-gray-800">{plan.metadata.aiModel}</p>
                </div>
              )}
              {plan.metadata.tags && (
                <div className="bg-white p-3 rounded-lg border col-span-1 md:col-span-2">
                  <p className="text-gray-600">Oznake</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {plan.metadata.tags.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleBackToPlanner}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6"
        >
          ← Nazad na planner za nove planove
        </Button>
      </div>
    </div>
  );
};

export default PlanViewer;
