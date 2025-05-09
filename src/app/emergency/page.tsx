"use client"

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Paper,
} from "@mui/material"
import Link from "next/link"
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"
import PhoneIcon from "@mui/icons-material/Phone"
import WarningIcon from "@mui/icons-material/Warning"
import SecurityIcon from "@mui/icons-material/Security"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import AccessTimeIcon from "@mui/icons-material/AccessTime"

const emergencyContacts = [
  {
    name: "Emergency Services",
    number: "911",
    description: "For life-threatening emergencies",
    icon: <LocalHospitalIcon color="error" />,
  },
  {
    name: "OTW Emergency Line",
    number: "1-800-OTW-HELP",
    description: "24/7 support for OTW-related emergencies",
    icon: <PhoneIcon color="error" />,
  },
  {
    name: "Roadside Assistance",
    number: "1-800-ROAD-HELP",
    description: "For vehicle breakdowns and accidents",
    icon: <DirectionsCarIcon color="error" />,
  },
]

const safetyResources = [
  {
    title: "Driver Safety",
    description: "Essential safety guidelines for drivers",
    icon: <SecurityIcon />,
    link: "/emergency/driver-safety",
  },
  {
    title: "Customer Safety",
    description: "Safety tips for customers",
    icon: <SecurityIcon />,
    link: "/emergency/customer-safety",
  },
  {
    title: "Emergency Procedures",
    description: "Step-by-step emergency response procedures",
    icon: <WarningIcon />,
    link: "/emergency/procedures",
  },
]

const nearbyHospitals = [
  {
    name: "City General Hospital",
    address: "123 Medical Center Dr",
    distance: "2.5 miles",
    phone: "(555) 123-4567",
  },
  {
    name: "Community Medical Center",
    address: "456 Health Ave",
    distance: "3.1 miles",
    phone: "(555) 234-5678",
  },
  {
    name: "Regional Emergency Care",
    address: "789 Emergency Ln",
    distance: "4.2 miles",
    phone: "(555) 345-6789",
  },
]

export default function EmergencyPage() {
  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary", py: 8 }}>
      <Container maxWidth="lg">
        {/* Emergency Alert Banner */}
        <Alert
          severity="error"
          sx={{
            mb: 4,
            fontSize: "1.1rem",
            "& .MuiAlert-icon": { fontSize: "2rem" },
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            If this is a life-threatening emergency, call 911 immediately
          </Typography>
        </Alert>

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
            Emergency Resources
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: "800px", mx: "auto" }}>
            Quick access to emergency contacts and safety information
          </Typography>
        </Box>

        {/* Emergency Contacts Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Emergency Contacts
          </Typography>
          <Grid container spacing={4}>
            {emergencyContacts.map((contact) => (
              <Grid item xs={12} md={4} key={contact.name}>
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
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {contact.icon}
                      <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>
                        {contact.name}
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="error" sx={{ mb: 2, fontWeight: 700 }}>
                      {contact.number}
                    </Typography>
                    <Typography color="text.secondary">{contact.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Safety Resources Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Safety Resources
          </Typography>
          <Grid container spacing={4}>
            {safetyResources.map((resource) => (
              <Grid item xs={12} md={4} key={resource.title}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {resource.icon}
                      <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>
                        {resource.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {resource.description}
                    </Typography>
                    <Button component={Link} href={resource.link} variant="outlined" color="primary">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Nearby Hospitals Section */}
        <Box>
          <Typography
            variant="h2"
            sx={{
              mb: 4,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Nearby Hospitals
          </Typography>
          <Grid container spacing={4}>
            {nearbyHospitals.map((hospital) => (
              <Grid item xs={12} md={4} key={hospital.name}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {hospital.name}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOnIcon />
                      </ListItemIcon>
                      <ListItemText primary={hospital.address} secondary={`${hospital.distance} away`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText primary={hospital.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTimeIcon />
                      </ListItemIcon>
                      <ListItemText primary="24/7 Emergency Care" />
                    </ListItem>
                  </List>
                  <Button
                    component={Link}
                    href={`https://maps.google.com/?q=${encodeURIComponent(hospital.address)}`}
                    target="_blank"
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Get Directions
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Additional Information */}
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            For non-emergency assistance, please visit our{" "}
            <Link href="/help" style={{ color: "inherit" }}>
              Help Center
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
