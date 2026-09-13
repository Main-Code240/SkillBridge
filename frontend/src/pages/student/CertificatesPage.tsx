import { useEffect, useState } from 'react';
import { Award, Plus, Trash2, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import type { Certificate } from '@/types';
import { formatDate } from '@/utils';

export default function CertificatesPage() {
  const { user } = useAuth();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    skill_name: '',
  });

  const fetchCerts = async () => {
    setLoading(true);

    try {
      setCertificates([]);
    } catch {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, [user]);

  const addCert = async () => {
    if (!user || !newCert.title.trim()) {
      toast.error('Please enter a certificate title.');
      return;
    }

    toast.error(
      'Certificate creation API is not connected yet.'
    );
  };

  const deleteCert = async (_id: string) => {
    if (!confirm('Remove this certificate?')) {
      return;
    }

    toast.error(
      'Certificate delete API is not connected yet.'
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">
            Certificates
          </h2>

          <p className="text-sm text-ink-muted">
            Manage your certifications and achievements
          </p>
        </div>

        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add Certificate
        </Button>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <Award className="h-8 w-8 text-brand-primary/40" />
            }
            title="No certificates yet"
            description="Add your certifications to showcase your achievements."
            action={
              <Button onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4" />
                Add Your First Certificate
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Award className="h-5 w-5" />
                </div>

                <button
                  onClick={() => deleteCert(c.id)}
                  className="text-ink-muted hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-3 font-bold text-ink">
                {c.title}
              </h3>

              <p className="text-sm text-ink-muted">
                {c.issuer}
              </p>

              {c.issue_date && (
                <p className="mt-1 text-xs text-ink-muted">
                  Issued: {formatDate(c.issue_date)}
                </p>
              )}

              {c.skill_name && (
                <Badge variant="brand">
                  {c.skill_name}
                </Badge>
              )}

              {c.certificate_url && (
                <a
                  href={c.certificate_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-1 text-sm text-brand-primary hover:underline"
                >
                  <Download className="h-4 w-4" />
                  View Certificate
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Certificate"
      >
        <div className="space-y-4">
          <Input
            label="Certificate Title"
            value={newCert.title}
            onChange={(e) =>
              setNewCert({
                ...newCert,
                title: e.target.value,
              })
            }
            placeholder="e.g. AWS Certified Developer"
          />

          <Input
            label="Issuer"
            value={newCert.issuer}
            onChange={(e) =>
              setNewCert({
                ...newCert,
                issuer: e.target.value,
              })
            }
            placeholder="e.g. Amazon Web Services"
          />

          <Input
            label="Issue Date"
            type="date"
            value={newCert.issue_date}
            onChange={(e) =>
              setNewCert({
                ...newCert,
                issue_date: e.target.value,
              })
            }
          />

          <Input
            label="Skill (optional)"
            value={newCert.skill_name}
            onChange={(e) =>
              setNewCert({
                ...newCert,
                skill_name: e.target.value,
              })
            }
            placeholder="e.g. Cloud Computing"
          />

          <Button onClick={addCert} className="w-full">
            Add Certificate
          </Button>
        </div>
      </Modal>
    </div>
  );
}