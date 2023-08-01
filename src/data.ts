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
              "全体通用：\n" +
              "烟点高，适合各种烹饪方式；\n" +
              "清爽不油腻，也可直接口服；\n" +
              "我们的产品理念是\"健康中国 · 倡导科学用油\"。\n" +
              "所有一级二级指的是质量等级。\n" +
              "研究显示，有机食品重金属及致癌的硝酸盐含量非常低，有害残留物质也非常少，这对人体健康非常重要。\n" +
              "\n" +
              "红花籽油系列：\n" +
              "\n" +
              "有机红花籽油 250ml：99元/瓶，一级，规格250mL*24/箱；\n" +
              "有机红花籽油 500ml：198元/瓶，一级，规格500mL*12/箱；\n" +
              "红花籽油 1L：89元/瓶，一级，规格1L*16/箱；\n" +
              "红花籽油 2L：168元/瓶，一级，规格2L*8/箱；\n" +
              "有机红花籽油250mL套装：488元/4瓶，一级，规格250mL*4*5/箱。\n" +
              "营养功效：\n" +
              "红花籽油中含有丰富的维生素E、谷维素、甾醇等营养成分；\n" +
              "有防治动脉硬化和降低血液胆固醇的作用；\n" +
              "维生素E具有抗氧化、延缓皮肤衰老以及淡化色斑的作用，还能提高人体免疫力，是预防癌症的营养物质；\n" +
              "谷维素具有促进睡眠的功效；\n" +
              "红花籽油的主要成分亚油酸被称为“血管清道夫”，对高血压、心绞痛、冠心病、动脉粥样硬化、老年性肥胖等症状有防治效果。\n" +
              "\n" +
              "亚麻籽油系列：\n" +
              "\n" +
              "采用低温压榨工艺，保留了亚麻籽的所有营养成分；\n" +
              "清爽不油腻，富含多不饱和脂肪酸，特别是 Omega-3，体内代谢后可以产生 DHA 和 EPA；\n" +
              "冷榨的亚麻籽油质清透、风味独特，是各类人群的首选健康食用油；\n" +
              "Omega-3 α-亚麻酸有助于预防心脑血管问题，并可有效降低血脂。\n" +
              "包装与价格：\n" +
              "有机亚麻籽油：\n" +
              "100ml：59元/瓶，一级，规格100mL*30/箱；\n" +
              "250ml：99元/瓶，一级，规格250mL*24/箱；\n" +
              "500ml：198元/瓶，一级，规格500mL*12/箱；\n" +
              "250ml 套装：488元/4瓶，一级，规格250mL*4*5/箱；\n" +
              "亚麻籽油：\n" +
              " 500ml：228元/4瓶，一级，规格500mL*4*3/箱；\n" +
              "\n" +
              "一级 2L：168元/瓶，一级，规格2L*8/箱；\n" +
              "一级 5L：368元/瓶，一级，规格5L*4/箱；\n" +
              "二级 5L：328元/瓶，二级，规格5L*4/箱。\n" +
              "\n" +
              "营养功效：\n" +
              "每日服用5-8ml亚麻籽油，六个星期后就可产生显著效果；\n" +
              "有助于改善抑郁情绪、增强精力、改善睡眠、缓解头痛和皮肤干燥等问题。\n" +
              "有机食品的优势：\n" +
              "\n" +
              "研究显示，有机食品重金属及致癌的硝酸盐含量非常低，有害残留物质也非常少，这对人体健康非常重要。\n" +
              "以上就是我们的有机亚麻籽油的主要信息，如果您还有其他问题，欢迎随时向我们咨询。\n" +
              "\n" +
              "\n" +
              "核桃油系列\n" +
              "1. **有机核桃油**\n" +
              "   - 规格：100mL，69元/瓶，规格：100mL*30/箱\n" +
              "   - 规格：500mL，218元/瓶，规格：500mL*12/箱\n" +
              "   - 规格：250mL，129元/瓶，规格：250mL*24/箱\n" +
              "   - 规格：500mL，399元/2瓶，规格：500mL*4*3/箱\n" +
              "   - 规格：250mL，498元/4瓶，规格：500mL*4*5/箱\n" +
              "\n" +
              "商品特点\n" +
              "\n" +
              "- 有机认证，无污染、无农残，低温物理螺旋冷榨\n" +
              "- 选用新疆纸皮核桃，最大程度的保留了核桃的营养成分\n" +
              "- α-亚麻酸和亚油酸是脑黄金DHA&ARA的前体物质，比例接近1:5易于吸收\n" +
              "- 核桃油中植物性的Ω-3、Ω-6脂肪酸系列含量达67%以上\n" +
              "- 塑化剂/反式脂肪酸未检出\n" +
              "- 丰富的角鲨烯、黄酮类物质和多酚化合物，增强人体免疫力，改善血管微循环、增强血管扩张能力、促进血液循环，调节血脂、降低胆固醇和血糖\n" +
              "\n" +
              "### 功效\n" +
              "\n" +
              "- 健脑益智，补脑、增加记忆力、促进大脑及神经系统发育\n" +
              "- 帮助人体补充DHA\n" +
              "- 保护细胞不受自由基损伤\n" +
              "- 全面提高人体免疫力\n" +
              "\n" +
              "## 戈壁工坊葵花仁油系列\n" +
              "\n" +
              "### 商品列表\n" +
              "\n" +
              "1. **清香葵花仁油**\n" +
              "   - 规格：1L，价格：29.9元/瓶，规格：1L*16/箱\n" +
              "   - 规格：3.68L，价格：92元，规格：3.68L*4/箱\n" +
              "   - 规格：5L，价格：129元，规格：5L*4/箱\n" +
              "2. **浓香葵花仁油**\n" +
              "   - 规格：5L，价格：119元，规格：5L*4/箱\n" +
              "3. **浓香葵花籽油**\n" +
              "   - 规格：20L，价格：360元，规格：20L*1/箱\n" +
              "\n" +
              "### 商品特点\n" +
              "\n" +
              "- 亚油酸超过60%\n" +
              "- 采用低温物理螺旋压榨工艺，保留了油料的天然风味和色泽\n" +
              "- 原料进口自葵花籽黄金产区哈萨克斯坦\n" +
              "- 相比葵花籽油，戈壁工坊葵花仁油采用剥壳去皮工艺，香味更纯、食用更安全、更健康\n" +
              "\n" +
              "\n" +
              "了解了，我会把这两个版本的商品合并成一个。以下是新的商品信息表：\n" +
              "\n" +
              "1. 商品名：千初新疆纯牛奶\n" +
              "   - 净含量：\n" +
              "     - 200mL×12\n" +
              "     - 200mL×15\n" +
              "   - 零售价：\n" +
              "     - 59元/箱 (200mL×12)\n" +
              "     - 69元/箱 (200mL×15)\n" +
              "   - 蛋白质：每100mL含3.0g蛋白质\n" +
              "   - 来源：北纬44°的天山牧场，地域辽阔，气候温润，远离工农业污染\n" +
              "   - 特色：奶源优质，蛋白质含量高，无任何添加、浓缩等过度加工\n" +
              "   - 优点：保持了新疆牛奶的纯正原味\n" +
              "   - 功效：提供优质蛋白质，有益身体健康，无添加、浓缩等过度加工，更接近天然，保持了新疆牛奶的纯正原味\n" +
              "\n" +
              "2. 商品名：千初高原纯牛奶\n" +
              "   - 净含量：200g×20 \n" +
              "   - 零售价：69元/箱\n" +
              "   - 蛋白质：每100g含3.3g蛋白质\n" +
              "   - 来源：海拔3200米以上的祁连山高原牧场\n" +
              "   - 特色：牛奶新鲜，安全，无添加，营养丰富\n" +
              "   - 优点：口感香浓，无腥膻味，更健康，符合清真标准\n" +
              "   - 功效：提供优质蛋白质，口感香浓，无添加，更健康，符合清真标准\n"
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