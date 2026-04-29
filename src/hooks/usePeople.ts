import { useState, useEffect } from 'react';
import { Person } from '@/pages/PeopleManagementPage';

// 自定义Hook，用于访问和管理人员数据
export const usePeople = () => {
  const [people, setPeople] = useState<Person[]>([]);

  // 从localStorage加载人员数据
  useEffect(() => {
    const loadPeople = () => {
      try {
        const savedPeople = localStorage.getItem('people');
        if (savedPeople) {
          setPeople(JSON.parse(savedPeople));
        }
      } catch (error) {
        console.error('Failed to load people data from localStorage:', error);
      }
    };

    // 加载数据
    loadPeople();

    // 创建一个自定义事件监听器，当人员数据在其他地方更新时，这里可以收到通知
    const handlePeopleUpdate = () => {
      loadPeople();
    };

    window.addEventListener('peopleUpdated', handlePeopleUpdate);
    
    return () => {
      window.removeEventListener('peopleUpdated', handlePeopleUpdate);
    };
  }, []);

  // 获取所有人员
  const getAllPeople = (): Person[] => {
    return people;
  };

  // 根据部门获取人员
  const getPeopleByDepartment = (department: string): Person[] => {
    return people.filter(person => person.department === department && person.isActive);
  };

  // 根据ID获取人员
  const getPersonById = (id: string): Person | undefined => {
    return people.find(person => person.id === id);
  };

  // 获取所有部门
  const getDepartments = (): string[] => {
    const departments = Array.from(new Set(people.map(person => person.department)));
    return departments;
  };

  // 通知其他组件人员数据已更新
  const notifyPeopleUpdated = () => {
    window.dispatchEvent(new CustomEvent('peopleUpdated'));
  };

  return {
    people,
    getAllPeople,
    getPeopleByDepartment,
    getPersonById,
    getDepartments,
    notifyPeopleUpdated
  };
};