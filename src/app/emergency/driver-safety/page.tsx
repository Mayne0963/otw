'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';
import VisibilityIcon from '@mui/icons-material/Visibility';

const safetyGuidelines = [
  {
    title: 'Vehicle Safety',
    icon: <DirectionsCarIcon />,
    items: [
      'Perform daily vehicle inspections before starting your shift',
      'Check tire pressure, brakes, and fluid levels regularly',
      'Keep your vehicle clean and well-maintained',
      'Ensure all lights and signals are working properly',
      'Keep emergency equipment (first aid kit, fire extinguisher) in your vehicle',
    ],
  },
  {
    title: 'Personal Safety',
    icon: <SecurityIcon />,
    items: [
      'Always wear your seatbelt',
      'Keep your phone mounted and use hands-free devices',
      'Take regular breaks to prevent fatigue',
      'Stay hydrated and maintain a healthy diet',
      'Keep emergency contacts readily accessible',
    ],
  },
  {
    title: 'Road Safety',
    icon: <SpeedIcon />,
    items: [
      'Obey all traffic laws and speed limits',
      'Maintain safe following distances',
      'Be extra cautious in adverse weather conditions',
      'Use turn signals and check blind spots',
      'Avoid distracted driving at all times',
    ],
  },
];

const emergencyProcedures = [
  {
    title: 'Accident Response',
    steps: [
      'Ensure your safety and the safety of others',
      'Call 911 if there are injuries or significant damage',
      'Contact OTW Emergency Line (1-800-OTW-HELP)',
      'Document the scene with photos if safe to do so',
      'Exchange information with other parties involved',
      'File an incident report in the OTW app',
    ],
  },
  {
    title: 'Medical Emergency',
    steps: [
      'Pull over safely if you feel unwell',
      'Call 911 for immediate medical assistance',
      'Contact OTW Emergency Line',
      'Use your first aid kit if necessary',
      'Follow emergency responder instructions',
      'Update OTW support with your status',
    ],
  },
  {
    title: 'Vehicle Breakdown',
    steps: [
      'Pull over to a safe location',
      'Turn on hazard lights',
      'Call Roadside Assistance (1-800-ROAD-HELP)',
      'Contact OTW support to update delivery status',
      'Stay with your vehicle if in a safe location',
      'Follow roadside assistance instructions',
    ],
  },
];

const safetyChecklist = [
  {
    title: 'Pre-Shift Checklist',
    items: [
      'Vehicle inspection completed',
      'Phone fully charged',
      'OTW app updated and working',
      'Emergency contacts saved',
      'First aid kit stocked',
      'Weather conditions checked',
    ],
  },
  {
    title: 'During Shift Checklist',
    items: [
      'Regular breaks taken',
      'Vehicle condition monitored',
      'Weather conditions monitored',
      'Route safety assessed',
      'Customer interactions documented',
      'Incidents reported immediately',
    ],
  },
  {
    title: 'Post-Shift Checklist',
    items: [
      'Vehicle condition checked',
      'Incidents reported',
      'Fuel level adequate for next shift',
      'Maintenance needs noted',
      'Safety concerns reported',
      'Rest period planned',
    ],
  },
];

export default function DriverSafetyPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 8,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              mb: 2,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 700,
            }}
          >
            Driver Safety Guidelines
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
          >
            Essential safety information and procedures for OTW drivers
          </Typography>
        </Box>

        {/* Emergency Alert */}
        <Alert
          severity="warning"
          sx={{
            mb: 6,
            fontSize: '1.1rem',
            '& .MuiAlert-icon': { fontSize: '2rem' },
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Remember: Your safety is our top priority. If you feel unsafe at any
            time, contact OTW support immediately.
          </Typography>
        </Alert>

        {/* Safety Guidelines Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Safety Guidelines
          </Typography>
          <Grid container spacing={4}>
            {safetyGuidelines.map((guideline) => (
              <Grid item xs={12} md={4} key={guideline.title}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {guideline.icon}
                      <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>
                        {guideline.title}
                      </Typography>
                    </Box>
                    <List>
                      {guideline.items.map((item) => (
                        <ListItem key={item} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <WarningIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Emergency Procedures Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Emergency Procedures
          </Typography>
          <Grid container spacing={4}>
            {emergencyProcedures.map((procedure) => (
              <Grid item xs={12} md={4} key={procedure.title}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {procedure.title}
                  </Typography>
                  <List>
                    {procedure.steps.map((step, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          >
                            {index + 1}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText primary={step} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Safety Checklists Section */}
        <Box>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Safety Checklists
          </Typography>
          {safetyChecklist.map((checklist) => (
            <Accordion key={checklist.title} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {checklist.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {checklist.items.map((item) => (
                    <ListItem key={item} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <VisibilityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Additional Resources */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            For additional safety resources or to report a safety concern,
            please visit our{' '}
            <Link href="/help" style={{ color: 'inherit' }}>
              Help Center
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
