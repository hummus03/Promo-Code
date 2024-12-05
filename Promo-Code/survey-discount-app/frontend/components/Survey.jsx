import React, { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Select,
  Banner
} from '@shopify/polaris';

export function Survey({ orderId, productId }) {
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyResponse: responses,
          orderId,
          productId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Your discount code is: ${data.discountCode}`);
      } else {
        setError('Failed to submit survey');
      }
    } catch (err) {
      setError('An error occurred while submitting the survey');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page title="Product Survey">
      <Layout>
        <Layout.Section>
          {error && (
            <Banner status="critical">
              <p>{error}</p>
            </Banner>
          )}
          {success && (
            <Banner status="success">
              <p>{success}</p>
            </Banner>
          )}
          <Card sectioned>
            <FormLayout>
              <Select
                label="How satisfied are you with this product?"
                options={[
                  {label: 'Very Satisfied', value: '5'},
                  {label: 'Satisfied', value: '4'},
                  {label: 'Neutral', value: '3'},
                  {label: 'Dissatisfied', value: '2'},
                  {label: 'Very Dissatisfied', value: '1'},
                ]}
                onChange={(value) => setResponses([...responses, {
                  questionId: 'satisfaction',
                  answer: value
                }])}
              />
              <TextField
                label="What could we improve?"
                multiline={4}
                onChange={(value) => setResponses([...responses, {
                  questionId: 'improvement',
                  answer: value
                }])}
              />
              <Button
                primary
                loading={isSubmitting}
                onClick={handleSubmit}
              >
                Submit Survey
              </Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 