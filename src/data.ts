import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {User} from "./interface";
import {isTokenOverLimit, countTokens} from "./utils.js";

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
    const initialPrompt = "你现在扮演一个客服的角色，接下来的问题都是以客人的角度问你的（可以结合你已知的知识来拓展介绍产品），下面是我们的产品信息：" +
              "全体产品特点：\n" +
              "我们的产品具有烟点高，适应各种烹饪方式的特点，食用时口感清爽不油腻。\n" +
              "我们坚持\"健康中国 · 倡导科学用油\"的产品理念。\n" +
              "我们的有机食品重金属和致癌硝酸盐含量极低，有害残留物质也非常少，对人体健康极为有益。\n" +
              "红花籽油系列：\n" +
              "产品名\t价格\t规格\n" +
              "有机红花籽油 250ml\t99元/瓶\t250mL*24/箱\n" +
              "有机红花籽油 500ml\t198元/瓶\t500mL*12/箱\n" +
              "红花籽油 1L\t89元/瓶\t1L*16/箱\n" +
              "红花籽油 2L\t168元/瓶\t2L*8/箱\n" +
              "有机红花籽油250mL套装\t488元/4瓶\t250mL45/箱\n" +
              "营养功效：红花籽油富含维生素E、谷维素、甾醇等营养成分，有助于防治动脉硬化、降低血胆固醇、延缓皮肤衰老、淡化色斑、增强免疫力等。\n" +
              "\n" +
              "亚麻籽油系列：\n" +
              "产品名\t价格\t规格\n" +
              "有机亚麻籽油 100ml\t59元/瓶\t100mL*30/箱\n" +
              "有机亚麻籽油 250ml\t99元/瓶\t250mL*24/箱\n" +
              "有机亚麻籽油 500ml\t198元/瓶\t500mL*12/箱\n" +
              "有机亚麻籽油 250ml套装\t488元/4瓶\t250mL45/箱\n" +
              "亚麻籽油 500ml\t228元/4瓶\t500mL43/箱\n" +
              "一级亚麻籽油 2L\t168元/瓶\t2L*8/箱\n" +
              "一级亚麻籽油 5L\t368元/瓶\t5L*4/箱\n" +
              "二级亚麻籽油 5L\t328元/瓶\t5L*4/箱\n" +
              "营养功效：亚麻籽油富含Omega-3，有助于改善心脑血管健康、降低血脂、改善抑郁情绪、增强精力、改善睡眠等。\n" +
              "\n" +
              "核桃油系列：\n" +
              "产品名\t价格\t规格\n" +
              "有机核桃油 100mL\t69元/瓶\t100mL*30/箱\n" +
              "有机核桃油 500mL\t218元/瓶\t500mL*12/箱\n" +
              "有机核桃油 250mL\t129元/瓶\t250mL*24/箱\n" +
              "有机核桃油 500mL套装\t399元/2瓶\t500mL43/箱\n" +
              "有机核桃油 250mL套装\t498元/4瓶\t500mL45/箱\n" +
              "营养功效：核桃油含有丰富的Ω-3、Ω-6脂肪酸、角鲨烯、黄酮类物质和多酚化合物，有助于健脑益智、保护细胞、提高免疫力等。\n" +
              "\n" +
              "戈壁工坊葵花仁油系列：\n" +
              "产品名\t价格\t规格\n" +
              "清香葵花仁油 1L\t29.9元/瓶\t1L*16/箱\n" +
              "清香葵花仁油 3.68L\t92元\t3.68L*4/箱\n" +
              "清香葵花仁油 5L\t129元\t5L*4/箱\n" +
              "浓香葵花仁油 5L\t119元\t5L*4/箱\n" +
              "浓香葵花籽油 20L\t360元\t20L/桶\n" +
              "营养功效：葵花籽油含有维生素E、亚油酸，能够清理血管、预防血栓、延缓衰老等。\n" +
              "\n" +
              "如有任何其他问题，欢迎随时向我们咨询。"
    const newUser: User = {
      username: username,
      chatMessage: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: initialPrompt,
        }
      ],
    };
    DB.data.push(newUser);
    // 打印当前的提示（prompt）以及计算提示的 token 占用
    console.log('Initial prompt:', initialPrompt);
    console.log('Token count of initial prompt:', countTokens(initialPrompt));

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