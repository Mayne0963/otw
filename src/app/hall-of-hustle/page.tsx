"use client"

import type React from "react"

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { useState } from "react"
import Link from "next/link"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import StarIcon from "@mui/icons-material/Star"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import StorefrontIcon from "@mui/icons-material/Storefront"

const topPerformers = [
  {
    name: "Alex Johnson",
    role: "Delivery Driver",
    image: "/assets/driver1.jpg",
    achievements: ["1000+ deliveries completed", "98% customer satisfaction", "Top rated driver 3 months in a row"],
    stats: {
      deliveries: "1,234",
      rating: "4.9",
      hours: "2,500+",
    },
  },
  {
    name: "Maria Garcia",
    role: "Restaurant Partner",
    image: "/assets/restaurant1.jpg",
    achievements: ["5000+ orders fulfilled", "Fastest preparation time", "Most consistent quality rating"],
    stats: {
      orders: "5,678",
      rating: "4.8",
      customers: "3,000+",
    },
  },
  {
    name: "David Chen",
    role: "Retail Partner",
    image: "/assets/retail1.jpg",
    achievements: ["2000+ deliveries completed", "Best inventory management", "Highest customer retention"],
    stats: {
      orders: "2,345",
      rating: "4.9",
      customers: "1,500+",
    },
  },
]

const successStories = [
  {
    title: "From Part-Time to Full-Time Success",
    description: "How Sarah turned her delivery gig into a thriving business",
    image: "/assets/success1.jpg",
    category: "Drivers",
  },
  {
    title: "Restaurant Growth Story",
    description: "How a local restaurant expanded their reach by 300%",
    image: "/assets/success2.jpg",
    category: "Restaurants",
  },
  {
    title: "Retail Revolution",
    description: "How a small shop became a regional delivery hub",
    image: "/assets/success3.jpg",
    category: "Retail",
  },
]

const categories = [
  { label: "All", icon: <EmojiEventsIcon /> },
  { label: "Drivers", icon: <LocalShippingIcon /> },
  { label: "Restaurants", icon: <RestaurantIcon /> },
  { label: "Retail", icon: <StorefrontIcon /> },
]

export default function HallOfHustlePage() {
  const [selectedCategory, setSelectedCategory] = useState(0)

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedCategory(newValue)
  }

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
            Hall of Hustle
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: "800px", mx: "auto" }}>
            Celebrating our top performers and success stories
          </Typography>
        </Box>

        {/* Top Performers Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 6,
              textAlign: "center",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Top Performers
          </Typography>
          <Grid container spacing={4}>
            {topPerformers.map((performer) => (
              <Grid item xs={12} md={4} key={performer.name}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-8px)",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Avatar
                        src={performer.image}
                        alt={performer.name}
                        sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
                      />
                      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                        {performer.name}
                      </Typography>
                      <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
                        {performer.role}
                      </Typography>
                    </Box>
                    <List>
                      {performer.achievements.map((achievement) => (
                        <ListItem key={achievement} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <StarIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={achievement} />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 3 }} />
                    <Grid container spacing={2}>
                      {Object.entries(performer.stats).map(([key, value]) => (
                        <Grid item xs={4} key={key}>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                            {value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Success Stories Section */}
        <Box>
          <Typography
            variant="h2"
            sx={{
              mb: 6,
              textAlign: "center",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Success Stories
          </Typography>
          <Box sx={{ mb: 6 }}>
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 4 }}
            >
              {categories.map((category, index) => (
                <Tab key={category.label} label={category.label} icon={category.icon} iconPosition="start" />
              ))}
            </Tabs>
            <Grid container spacing={4}>
              {successStories.map((story) => (
                <Grid item xs={12} md={4} key={story.title}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      component="img"
                      src={story.image}
                      alt={story.title}
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                        {story.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {story.description}
                      </Typography>
                      <Button
                        component={Link}
                        href={`/hall-of-hustle/stories/${story.title.toLowerCase().replace(/\s+/g, "-")}`}
                        variant="outlined"
                        color="primary"
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: "center",
            p: 6,
            bgcolor: "primary.main",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Be Part of the Success
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join our community and create your own success story
          </Typography>
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            color="secondary"
            size="large"
            sx={{ py: 1.5, px: 4 }}
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
