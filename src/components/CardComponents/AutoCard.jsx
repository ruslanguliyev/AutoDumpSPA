import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

export default function ActionAreaCard() {
    return (
        <Card sx={{ maxWidth: 270 }}>
            <CardActionArea>
                <CardMedia 
                    component="img"
                    image="/src/assets/images/5e35c1471fe47nt(8).jpeg"
                    alt="Mercedes-Benz G-Class"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Mercedes-Benz G-Class
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Mercedes-Benz G-Class is a luxury SUV that combines off-road capability with high-end comfort and technology.
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
