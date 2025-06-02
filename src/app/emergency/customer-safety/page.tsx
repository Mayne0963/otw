"use client";

export const dynamic = "force-dynamic";

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
  Button,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Link from "next/link";

const safetyGuidelines = [
  {
    title: "Order Verification",
    icon: <VerifiedUserIcon />,
    items: [
      "Always verify driver details in the app before pickup",
      "Check the vehicle description and license plate",
      "Confirm the order details with the driver",
      "Use the app's in-app messaging for communication",
      "Report any suspicious activity immediately",
    ],
  },
  {
    title: "Delivery Safety",
    icon: <DirectionsCarIcon />,
    items: [
      "Choose a well-lit, public location for delivery",
      "Have someone present during late-night deliveries",
      "Keep your phone charged and accessible",
      "Use contactless delivery when possible",
      "Report any delivery issues through the app",
    ],
  },
  {
    title: "Personal Information",
    icon: <PersonIcon />,
    items: [
      "Never share personal information with drivers",
      "Use the app for all communications",
      "Keep your payment information secure",
      "Enable two-factor authentication",
      "Regularly review your account activity",
    ],
  },
];

const serviceSpecificGuidelines = [
  {
    title: "Food Delivery",
    icon: <RestaurantIcon />,
    guidelines: [
      "Check food temperature upon delivery",
      "Verify order contents before accepting",
      "Report any food safety concerns",
      "Use contactless delivery options",
      "Keep delivery instructions clear and specific",
    ],
  },
  {
    title: "Grocery Delivery",
    icon: <StorefrontIcon />,
    guidelines: [
      "Specify any allergies or dietary restrictions",
      "Request specific handling for fragile items",
      "Verify perishable items upon delivery",
      "Provide clear delivery instructions",
      "Report any damaged or missing items",
    ],
  },
  {
    title: "Ride Services",
    icon: <DirectionsCarIcon />,
    guidelines: [
      "Share your trip details with a friend",
      "Sit in the back seat when possible",
      "Use the app's safety features",
      "Verify driver and vehicle details",
      "Report any safety concerns immediately",
    ],
  },
];

const emergencyProcedures = [
  {
    title: "Suspicious Activity",
    steps: [
      "Do not engage with suspicious individuals",
      "Move to a safe location if possible",
      "Call 911 for immediate danger",
      "Contact OTW Emergency Line (1-800-OTW-HELP)",
      "Report the incident through the app",
      "Document any relevant details",
    ],
  },
  {
    title: "Delivery Issues",
    steps: [
      "Contact the driver through the app",
      "Use the in-app support feature",
      "Document the issue with photos if applicable",
      "Request a refund if necessary",
      "Report the issue to customer support",
      "Leave appropriate feedback",
    ],
  },
  {
    title: "Account Security",
    steps: [
      "Change your password immediately",
      "Enable two-factor authentication",
      "Review recent account activity",
      "Contact OTW support",
      "Monitor your payment methods",
      "Report any unauthorized charges",
    ],
  },
];

export default function CustomerSafetyPage() {
  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary", py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 8,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              mb: 2,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
              fontWeight: 700,
            }}
          >
            Customer Safety Guidelines
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: "800px", mx: "auto" }}
          >
            Essential safety information and best practices for using OTW
            services
          </Typography>
        </Box>

        {/* Safety Alert */}
        <Alert
          severity="warning"
          sx={{
            mb: 6,
            fontSize: "1.1rem",
            "& .MuiAlert-icon": { fontSize: "2rem" },
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Your safety is our priority. If you feel unsafe at any time, contact
            OTW support immediately.
          </Typography>
        </Alert>

        {/* Safety Guidelines Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Safety Guidelines
          </Typography>
          <Grid container spacing={4}>
            {safetyGuidelines.map((guideline) => (
              <Grid item xs={12} md={4} key={guideline.title}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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

        {/* Service-Specific Guidelines */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Service-Specific Guidelines
          </Typography>
          <Grid container spacing={4}>
            {serviceSpecificGuidelines.map((service) => (
              <Grid item xs={12} md={4} key={service.title}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    {service.icon}
                    <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>
                      {service.title}
                    </Typography>
                  </Box>
                  <List>
                    {service.guidelines.map((guideline) => (
                      <ListItem key={guideline} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <SecurityIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={guideline} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Emergency Procedures */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Emergency Procedures
          </Typography>
          <Grid container spacing={4}>
            {emergencyProcedures.map((procedure) => (
              <Grid item xs={12} md={4} key={procedure.title}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: "2px solid",
                    borderColor: "error.main",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      {procedure.title}
                    </Typography>
                    <List>
                      {procedure.steps.map((step, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Typography
                              variant="h6"
                              color="error"
                              sx={{ fontWeight: 700 }}
                            >
                              {index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Additional Resources */}
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            For additional safety resources or to report a safety concern,
            please visit our{" "}
            <Link href="/help" style={{ color: "inherit" }}>
              Help Center
            </Link>
          </Typography>
          <Button
            component={Link}
            href="/emergency"
            variant="contained"
            color="primary"
            size="large"
            sx={{ py: 1.5, px: 4 }}
          >
            Back to Emergency Resources
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
