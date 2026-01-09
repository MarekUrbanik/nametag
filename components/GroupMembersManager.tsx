'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import PillSelector from './PillSelector';
import { formatFullName } from '@/lib/nameUtils';

interface Person {
  id: string;
  name: string;
  surname?: string | null;
  nickname?: string | null;
}

interface Member {
  id: string;
  name: string;
  surname?: string | null;
  nickname?: string | null;
  // Member is a person already in the group
}

interface GroupMembersManagerProps {
  groupId: string;
  groupName: string;
  currentMembers: Member[];
  availablePeople: Person[];
}

export default function GroupMembersManager({
  groupId,
  groupName,
  currentMembers,
  availablePeople,
}: GroupMembersManagerProps) {
  const t = useTranslations('groups.members');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Transform people to PillItem format
  const pillItems = availablePeople.map((person) => ({
    id: person.id,
    label: formatFullName(person),
  }));

  const selectedItems = currentMembers.map((member) => ({
    id: member.id,
    label: formatFullName(member),
  }));

  const handleAdd = async (item: { id: string; label: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: item.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || t('errorAdd'));
        return;
      }

      toast.success(t('addedSuccess', { name: item.label, group: groupName }));
      router.refresh();
    } catch {
      toast.error(t('errorConnection'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    const member = currentMembers.find((m) => m.id === itemId);
    if (!member) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || t('errorRemove'));
        return;
      }

      toast.success(t('removedSuccess', { name: formatFullName(member), group: groupName }));
      router.refresh();
    } catch {
      toast.error(t('errorConnection'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PillSelector
      label={t('label', { count: currentMembers.length })}
      selectedItems={selectedItems}
      availableItems={pillItems}
      onAdd={handleAdd}
      onRemove={handleRemove}
      placeholder={t('placeholder')}
      emptyMessage={t('emptyMessage')}
      helpText={t('helpText')}
      removeAriaLabel={t('remove')}
      clearAllAriaLabel={t('clearAll')}
      allSelectedMessage={t('allSelected')}
      isLoading={isLoading}
    />
  );
}
