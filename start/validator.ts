import vine from '@vinejs/vine';

import { RuleNameMessagesProvider } from '#shared/rule_name_messages_provider';

vine.messagesProvider = new RuleNameMessagesProvider();
