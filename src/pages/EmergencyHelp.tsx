import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmergencyHelp = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Help & Helplines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">If you or someone else is in immediate danger, call your local emergency services right away.</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">India (example)</h3>
                <p>National Helpline for Mental Health (NMHH): 14416</p>
                <p>Emergency Services: 112</p>
              </div>
              <div>
                <h3 className="font-semibold">If poisoning is suspected</h3>
                <p>Call local emergency services and contact a poison control center immediately.</p>
              </div>
              <div>
                <h3 className="font-semibold">Immediate actions</h3>
                <ul className="list-disc ml-6">
                  <li>Ensure the person is safe from immediate harm</li>
                  <li>Call emergency services</li>
                  <li>Stay with the person until help arrives</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={() => window.location.href = '/'}>Return to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyHelp;
