import { autos } from '../../data/data.js';
import AutoCard from '../../components/CardComponents/AutoCard.jsx';
import { Grid, Container, Box } from '@mui/material';

export default function Home() {
  return (
    <Box sx={{ bgcolor: '#fafafa', py: 8 }}>
      <Container>
        <Grid container spacing={{ xs: 6, md: 3 }}>
          {autos.map((car, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <AutoCard car={car} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

  );
}