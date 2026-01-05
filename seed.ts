import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User, { Role } from './src/app/models/user.model';
import Creator from './src/app/models/creator.model';
import Agency from './src/app/models/agency.model';
import Review from './src/app/models/review.model';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('🌱 Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Creator.deleteMany({});
        await Agency.deleteMany({});
        await Review.deleteMany({});
        console.log('🧹 Cleared existing data');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // --- 1. Create Agencies ---
        const agencyA = await Agency.create({
            name: 'Elite Models',
            location: 'Bangkok',
            description: 'Premium modeling agency',
            logoUrl: '/mock/creators/1.png'
        });

        const agencyB = await Agency.create({
            name: 'Angel club',
            location: 'Pattaya',
            description: 'Top talent agency',
            logoUrl: '/mock/creators/2.png'
        });
        console.log('✅ Agencies created');

        // --- 2. Create Users ---
        const users = [];
        for (let i = 1; i <= 5; i++) {
            const user = await User.create({
                email: `user${i}@example.com`,
                username: `User${i}`,
                password: hashedPassword,
                role: Role.USER,
                displayName: `Member ${i}`,
                avatarUrl: `/mock/creators/${(i % 8) + 1}.png`,
                isCreator: false
            });
            users.push(user);
        }
        console.log('✅ Regular Users created');

        // --- 3. Create Creators ---
        const creatorData = [
            {
                name: 'Runglisa',
                email: 'runglisa@fiwfan.com',
                image: '1.png',
                location: 'ธนบุรี',
                province: 'Bangkok',
                age: 24,
                price: 1500,
                stats: { h: 165, w: 48, p: '34-24-35' },
                bio: '💛รับงานดูแลพี่ๆใจดีค่ะ\n💛นิสัยน่ารัก ขี้อ้อน เอาใจเก่ง\n💛ฟิลแฟน 100% ไม่เร่งงาน',
                verified: true
            },
            {
                name: 'Ammy',
                email: 'ammy@fiwfan.com',
                image: '2.png',
                location: 'บางนา',
                province: 'Bangkok',
                age: 22,
                price: 2000,
                stats: { h: 160, w: 45, p: '32-23-34' },
                bio: 'ตัวเล็กสเปคป๋า ขี้อ้อนสุดๆ',
                verified: true
            },
            {
                name: 'Sky',
                email: 'sky@fiwfan.com',
                image: '3.png',
                location: 'ลาดพร้าว',
                province: 'Bangkok',
                age: 25,
                price: 1800,
                stats: { h: 168, w: 50, p: '34-25-36' },
                bio: 'หุ่นนางแบบ เอวเอส',
                verified: false
            },
            {
                name: 'Cream',
                email: 'cream@fiwfan.com',
                image: '4.png',
                location: 'สุขุมวิท',
                province: 'Bangkok',
                age: 21,
                price: 2500,
                stats: { h: 162, w: 46, p: '33-24-35' },
                bio: 'ผิวขาวโอโม่ น่ารักฟรุ้งฟริ้ง',
                verified: true
            },
            {
                name: 'Mint',
                email: 'mint@fiwfan.com',
                image: '5.png',
                location: 'รังสิต',
                province: 'Pathum Thani',
                age: 23,
                price: 1500,
                stats: { h: 164, w: 47, p: '34-24-34' },
                bio: 'เปรี้ยวซ่า ท้าให้ลอง',
                verified: false
            },
            {
                name: 'Alice',
                email: 'alice@fiwfan.com',
                image: '6.png',
                location: 'พัทยา',
                province: 'Chonburi',
                age: 26,
                price: 3000,
                stats: { h: 170, w: 52, p: '36-25-36' },
                bio: 'สาวลูกครึ่ง คุยเก่ง',
                verified: true
            },
            {
                name: 'Bew',
                email: 'bew@fiwfan.com',
                image: '7.png',
                location: 'เชียงใหม่',
                province: 'Chiang Mai',
                age: 20,
                price: 1200,
                stats: { h: 158, w: 44, p: '32-23-33' },
                bio: 'สาวเหนือ น่ารัก เรียบร้อย',
                verified: false
            },
            {
                name: 'Gigi',
                email: 'gigi@fiwfan.com',
                image: '8.png',
                location: 'ภูเก็ต',
                province: 'Phuket',
                age: 24,
                price: 3500,
                stats: { h: 166, w: 49, p: '35-24-35' },
                bio: 'สายฝอ แซ่บๆ',
                verified: true
            }
        ];

        const creators = [];
        for (const c of creatorData) {
            const user = await User.create({
                email: c.email,
                username: c.name.toLowerCase(),
                password: hashedPassword,
                role: Role.CREATOR,
                displayName: c.name,
                isCreator: true,
                avatarUrl: `/mock/creators/${c.image}`
            });

            const creator = await Creator.create({
                user: user._id,
                displayName: c.name,
                bio: c.bio,
                location: c.location,
                province: c.province,
                age: c.age,
                height: c.stats.h,
                weight: c.stats.w,
                proportions: c.stats.p,
                price: c.price,
                isVerified: c.verified,
                isHot: c.age < 23,
                images: [`/mock/creators/${c.image}`, `/mock/creators/${(parseInt(c.image[0]) % 8) + 1}.png`]
            });
            creators.push(creator);
            console.log(`Created Creator: ${c.name}`);
        }

        // --- 4. Create Reviews ---
        const comments = [
            "น้องน่ารักมากครับ ตรงปก",
            "บริการดี เจ้าหญิงมาก",
            "คุ้มค่ามากครับ แนะนำเลย",
            "ตัวจริงสวยกว่าในรูปอีก",
            "เป็นกันเอง ไม่เร่งเวลา"
        ];

        for (const creator of creators) {
            const reviewCount = Math.floor(Math.random() * 4);
            for (let k = 0; k <= reviewCount; k++) {
                const reviewer = users[Math.floor(Math.random() * users.length)];
                await Review.create({
                    creator: creator._id,
                    user: reviewer._id,
                    rating: 5,
                    comment: comments[Math.floor(Math.random() * comments.length)]
                });
            }
        }
        console.log('✅ Reviews created');

        console.log('🎉 MongoDB Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
