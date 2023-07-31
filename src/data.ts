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
          content: "你现在扮演一个客服的角色，接下来的问题都是以客人的角度问你的，下面是我们的产品信息" +
              "| 商品名称 | 规格 | 价格 | 质量等级 | 装箱规格 | 产品特性 | 营养功效 | 有机食品的优势 |\n" +
              "|---|---|---|---|---|---|---|---|\n" +
              "| 有机红花籽油 | 250ml | 99元/瓶 | 一级 | 250mL*24/箱 | 烟点高，适合各种烹饪方式；清爽不油腻，也可直接口服 | 含有丰富的维生素E、谷维素、甾醇等营养成分；有防治动脉硬化和降低血液胆固醇的作用；维生素E具有抗氧化、延缓皮肤衰老以及淡化色斑的作用，还能提高人体免疫力，是预防癌症的营养物质；谷维素具有促进睡眠的功效；红花籽油的主要成分亚油酸被称为“血管清道夫”，对高血压、心绞痛、冠心病、动脉粥样硬化、老年性肥胖等症状有防治效果。 | 重金属及致癌的硝酸盐含量非常低，有害残留物质也非常少 |\n" +
              "| 有机红花籽油 | 500ml | 198元/瓶 | 一级 | 500mL*12/箱 | 同上 | 同上 | 同上 |\n" +
              "| 红花籽油 | 1L | 89元/瓶 | 一级 | 1L*16/箱 | 同上 | 同上 | 同上 |\n" +
              "| 红花籽油 | 2L | 168元/瓶 | 一级 | 2L*8/箱 | 同上 | 同上 | 同上 |\n" +
              "| 有机红花籽油套装 | 250ml*4 | 488元/4瓶 | 一级 | 250mL*4*5/箱 | 同上 | 同上 | 同上 |\n" +
              "| 戈壁工坊有机亚麻籽油 | 100ml | 59元/瓶 | 一级 | 100mL*30/箱 | 采用低温压榨工艺，保留了亚麻籽的所有营养成分；清爽不油腻，富含多不饱和脂肪酸，特别是 Omega-3，体内代谢后可以产生 DHA 和 EPA；冷榨的亚麻籽油质清透、风味独特，是各类人群的首选健康食用油；Omega-3 α-亚麻酸有助于预防心脑血管问题，并可有效降低血脂。 | 每日服用5-8ml亚麻籽油，六个星期后就可产生显著效果；有助于改善抑郁情绪、增强精力、改善睡眠、缓解头痛和皮肤干燥等问题。 | 重金属及致癌的硝酸盐含量非常低，有害残留物质也非常少 |\n" +
              "| 有机亚麻籽油 | 250ml | 99元/瓶 | 一级 | 250mL*24/箱 | 同上 | 同上 | 同上 |\n" +
              "| 有机亚麻籽油 | 500ml | 198元/瓶 | 一级 | 500mL*12/箱 | 同上 | 同上 | 同上 |\n" +
              "| 亚麻籽油 | 500ml*4 | 228元/4瓶 | 一级 | 500mL*4*3/箱 | 同上 | 同上 | 同上 |\n" +
              "| 有机亚麻籽油套装 | 250ml*4 | 488元/4瓶 | 一级 | 250mL*4*5/箱 | 同上 | 同上 | 同上 |\n" +
              "| 一级亚麻籽油 | 2L | 168元/瓶 | 一级 | 2L*8/箱 | 同上 | 同上 | 同上 |\n" +
              "| 一级亚麻籽油 | 5L | 368元/瓶 | 一级 | 5L*4/箱 | 同上 | 同上 | 同上 |\n" +
              "| 二级亚麻籽油 | 5L | 328元/瓶 | 二级 | 5L*4/箱 | 同上 | 同上 | 同上 |"
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