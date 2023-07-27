import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {User} from "./interface";
import {isTokenOverLimit} from "./utils.js";

/**
 * 使用内存作为数据库
 */

class DB {
  private static data: User[] = [];

  /**
   * 添加一个用户, 如果用户已存在则返回已存在的用户
   * @param username
   */
  public addUser(username: string): User {
    let existUser = DB.data.find((user) => user.username === username);
    if (existUser) {
      console.log(`用户${username}已存在`);
      return existUser;
    }
    const newUser: User = {
      username: username,
      chatMessage: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: "你现在扮演一个客服的角色，接下来的问题都是以客人的角度问你的，下面是我们的产品信息。 我们的产品是戈壁工坊亚麻籽油，日常价格为139.9元，现在只需要99.9元。保质期为18个月，全国包邮（除了新疆、西藏、内蒙古、海南、港澳台地区以及疫情区），48小时内送达。一个礼包内包含4瓶500ml的亚麻籽油。包含：安心购运费险7天无理由退换（未拆封），破损包赔偿。一、品牌介绍\n" +
              "“戈壁工坊”是阳光绿地公司旗下的高端食用油品牌。阳光绿地为省级龙头企业、高新技术企业，粮油加工企业10强，阳光绿地秉承“以质量求生存，以信誉求发展”的企业宗旨，精选剥仁葵油、压榨浓香型葵花仁油、亚麻籽油、红花籽油、核桃油、芥花籽油等高品质健康食用油产品加工及OEM ，冷榨油脂产能、葵花籽剥壳处理能力达全国之首。\n" +
              "二、产品卖点：\n" +
              "原材料：选用100%进口哈萨克斯坦亚麻籽，远离工业区，天然无污染；(可展示进口报关单)\n" +
              "冷榨工艺：一级低温冷榨，最大限度地保护生物活性营养成分，但是这种方式出油率很低，所以每一滴都很珍贵。冷榨1瓶亚麻籽油，需要3斤新鲜的亚麻籽。（可展示专利书）\n" +
              "充氮封鲜：采用充氮封鲜技术，有效隔绝氧气，避免营养流失，并保证口感更加新鲜。\n" +
              "机制：今天直播间99.9四瓶，每瓶500ml，保证每瓶油都是一级冷榨进口原料的纯正亚麻籽油，你平时买一瓶这样含量得70、80元；\n" +
              "亚麻酸：亚麻酸含量在50%-68%，不饱和脂肪酸70%，保证做到每一瓶亚麻酸含量都在50%以上，随机检测亚麻酸含量54.9%(可展示检测报告)；\n" +
              "适用人群：1.某糖高脂高的人群    2.大号困难户  3.刷脂、皮肤管理人群  4.宝妈儿童\n" +
              "三、注意事项（1岁以下不建议食用；保存方式：阴凉干燥避光处存放，；食用方法（烟点107°）：适合低温烹调，凉拌、煲汤调味、拌入馅料、儿童辅食添加；不适合高温炒菜\n"
        }
      ],
    };
    DB.data.push(newUser);
    return newUser;
  }

  /**
   * 根据用户名获取用户, 如果用户不存在则添加用户
   * @param username
   */
  public getUserByUsername(username: string): User {
    return DB.data.find((user) => user.username === username) || this.addUser(username);
  }

  /**
   * 获取用户的聊天记录
   * @param username
   */
  public getChatMessage(username: string): Array<ChatCompletionRequestMessage> {
    return this.getUserByUsername(username).chatMessage;
  }

  /**
   * 设置用户的prompt
   * @param username
   * @param prompt
   */
  public setPrompt(username: string, prompt: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      user.chatMessage.find(
        (msg) => msg.role === ChatCompletionRequestMessageRoleEnum.System
      )!.content = prompt;
    }
  }

  /**
   * 添加用户输入的消息
   * @param username
   * @param message
   */
  public addUserMessage(username: string, message: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      while (isTokenOverLimit(user.chatMessage)){
        // 删除从第2条开始的消息(因为第一条是prompt)
        user.chatMessage.splice(1,1);
      }
      user.chatMessage.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: message,
      });
    }
  }

  /**
   * 添加ChatGPT的回复
   * @param username
   * @param message
   */
  public addAssistantMessage(username: string, message: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      while (isTokenOverLimit(user.chatMessage)){
        // 删除从第2条开始的消息(因为第一条是prompt)
        user.chatMessage.splice(1,1);
      }
      user.chatMessage.push({
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: message,
      });
    }
  }

  /**
   * 清空用户的聊天记录, 并将prompt设置为默认值
   * @param username
   */
  public clearHistory(username: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      user.chatMessage = [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: "You are a helpful assistant."
        }
      ];
    }
  }

  public getAllData(): User[] {
    return DB.data;
  }
}
const DBUtils = new DB();
export default DBUtils;