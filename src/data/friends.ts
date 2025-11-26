// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "leyi",
		imgurl: "https://leyi.live/img/head.jpg",
		desc: "25届web手",
		siteurl: "https://leyi.live",
		tags: ["web" ,"aurora"],
	},
	{
		id: 2,
		title: "err0r_233",
		imgurl:
			"https://err0r233.github.io/images/touxiang.png",
		desc: "老登，熬夜大户，博客当百科全书用，但是现在不更新了",
		siteurl: "https://err0r233.github.io/",
		tags: ["web", "aurora"],
	},
	{
		id: 3,
		title: "二十一画生",
		imgurl: "https://p4v31-21.github.io/assets/img/favicons/web-app-manifest-512x512.png",
		desc: "23届老登,web领域大神，教我们渗透",
		siteurl: "https://p4v31-21.github.io/",
		tags: ["web", "aurora"],
	},
	{
		id: 4,
		title: "triode",
		imgurl: "https://triodelzx.github.io/img/512.png",
		desc: "书记，接近神的存在",
		siteurl: "http://www.triode.cc/",
		tags: ["crypto", "aurora"],
	},
	{
		id: 5,
		title: "caterpie",
		imgurl: "https://www.caterpie771.cn/wp-content/uploads/2024/09/%E5%A4%B4%E5%83%8F.jpg",
		desc: "22届老登，web开发苦手，web安全菜鸟(自称）",
		siteurl: "https://www.caterpie771.cn/",
		tags: ["web", "aurora"],
	},
	{
		id: 6,
		title: "cl0wn",
		imgurl: "http://cdn.clown2024.cn/202407151818951.jpeg",
		desc: "22届老登，web领域大神，人很好，经常帮我回答问题",
		siteurl: "https://clowsman.github.io/",
		tags: ["web", "aurora"],
	},
	{
		id: 7,
		title: "xiaochai_123",
		imgurl: "https://xiaochai-123.github.io/images/my-avatar.jpg",
		desc: "25届web手；小工具爱好者 | CTF新人 | CS学生（自称）",
		siteurl: "https://xiaochai-123.github.io/",
		tags: ["web", "aurora"],
	},
	{
		id: 8,
		title: "qsdz",
		imgurl: "https://hasegawaazusa.github.io/images/android-chrome-144x144.png",
		desc: "超级老登，自称25届，实则25届毕业，和书记一样的全能手，喜欢水群",
		siteurl: "https://hasegawaazusa.github.io/",
		tags: ["crypto", "misc"],
	},
	{
		id: 9,
		title: "266IO",
		imgurl: "https://cat26610.github.io/images/avatar.jpg",
		desc: "25届re手，逆向大手子，喜欢猫猫",
		siteurl: "https://cat26610.github.io",
		tags: ["Reverse", "aurora"],
	},
	{
		id: 10,
		title: "rinne",
		imgurl: "https://www.rinne.in/_next/image?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F180847792%3Fv%3D4&w=384&q=75",
		desc: "25届web手，开发大佬，很强",
		siteurl: "https://www.rinne.in/",
		tags: ["web", "aurora"],
	},
	{
		id: 11,
		title: "9C±Void",
		imgurl: "https://cauliweak9.github.io/img/head.jpg",
		desc: "9C神",
		siteurl: "https://cauliweak9.github.io",
		tags: ["misc", "Blockchain", "aurora"],
	},
	{
		id: 12,
		title: "marin",
		imgurl: "https://raw.githubusercontent.com/btop251/my_blog/refs/heads/main/src/assets/images/marin.jpg",
		desc: "misc兼web大手子，强得可怕",
		siteurl: "https://wwwmarin.xyz/#",
		tags: ["misc", "web", "aurora"],
	},
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
