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
          content: "亚麻籽油：我们的亚麻籽油富含亚油酸，含量高达60%以上，被誉为“血管清道夫”。亚麻籽油对人体有多重益处，尤其是其高含量的omega-3脂肪酸（α-亚麻酸）。这种油具有260度的高烟点，可以满足多样化的烹饪需求，尤其是凉拌菜肴。此外，亚麻籽油的口感清爽，不油腻，既能提供必要的营养，又不会让人感觉过油。\n" +
              "\n" +
              "红花籽油：戈壁工坊的红花籽油是从新疆优质红花中提取的，新疆红花种植历史已经超过200年，至今仍保留原始的种子。红花籽油中的亚油酸含量高达78%，因此被称为“亚油酸之王”。红花籽油对身体有多重益处，包括高抗氧化能力，有助于抗老化，适合三高人群食用。\n" +
              "\n" +
              "有机葵花籽油：我们的有机葵花籽油源自哈萨克斯坦，使用低温物理螺旋压榨技术，以保留更多营养成分和原始风味。相比于普通的葵花籽油，我们的葵花籽油经过剥壳去皮处理，使得其香味更纯，更适合中式烹饪。\n" +
              "\n" +
              "有机核桃油：我们的有机核桃油富含90%的不饱和脂肪酸，是一种营养丰富的健康食品。由于其黄金比例1:5的Omega-3和Omega-6含量，这种油特别适合满足人体所需的健康脂肪。\n" +
              "\n" +
              "沙棘油和葡萄籽油：我们的沙棘油和葡萄籽油富含维他命E和Omega-7，具有超强的抗氧化能力，是维他命E的50倍，能延缓衰老，有益健康。\n" +
              "\n" +
              "购买和使用：\n" +
              "\n" +
              "产品质量保证：我们的所有产品都来自优质原料，使用低温物理螺旋冷榨工艺制成，以最大程度地保留原料的营养价值和风味。我们的产品是无污染，无农残，可以放心食用。\n" +
              "\n" +
              "产品的食用方法：我们的各种油类产品烟点高，适合各种烹饪方式，包括蒸、煮、炒、煎、烘焙以及凉拌等。可以根据个人口味和需求选择不同的烹饪方式。\n" +
              "\n" +
              "公司介绍：\n" +
              "\n" +
              "我们的公司始终秉持“天然有机、更健康”的理念，为消费者提供最优质的产品。我们的产品原料来自全球各地的高品质产地，例如哈萨克斯坦的葵花籽，新疆的红花等。我们的品牌已经在多个电视节目中被推荐，受到了广大消费者和名人网红的喜爱。\n" +
              "\n" +
              "公益活动：\n" +
              "\n" +
              "我们的公司始终致力于公益事业，多年来我们已经进行了一系列的公益活动，如为山区的孩子们送去温暖和关爱，为贫困家庭捐赠公益资金和物资等。\n" +
              "\n" +
              "希望以上信息可以帮助到您，如果您还有其他问题，欢迎随时向我们提问。"
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