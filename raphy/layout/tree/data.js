const data = [
  {
    "id": "i-1xa2axv3",
    "type": "instance",
    "title": "主机 1",
    "metadata": {},
    "parent": "KseI6YvxT",
    "children": []
  },
  {
    "id": "v-da2x2a",
    "type": "volume",
    "title": "硬盘 1",
    "metadata": {},
    "parent": "i-1xa2axv3",
    "children": []
  },
  {
    "id": "v-xa234g",
    "type": "volume",
    "title": "硬盘 2",
    "metadata": {},
    "parent": "i-1xa2axv3",
    "children": []
  },
  {
    "id": "KseI6YvxT",
    "type": "vxnet",
    "title": "基础网络 1",
    "metadata": {},
    "parent": 0,
    "children": []
  },
  {
    "id": "MKOokP-E7",
    "type": "instance",
    "title": "主机 2",
    "metadata": {},
    "parent": "KseI6YvxT",
    "children": []
  },
  {
    "id": "TolLZ959y",
    "type": "volume",
    "title": "硬盘 3",
    "metadata": {},
    "parent": "i-1xa2axv3",
    "children": []
  },
  {
    "id": "Bm3t0y8LN",
    "type": "eip",
    "title": "EIP 1",
    "metadata": {},
    "parent": "i-1xa2axv3",
    "children": []
  },
  {
    "id": "Qyn7I5vuP",
    "type": "keypair",
    "title": "ssh key 1",
    "metadata": {},
    "parent": "MKOokP-E7",
    "children": []
  },
  {
    "id": "RcSlj3GTa",
    "type": "keypair",
    "title": "ssh key 2",
    "metadata": {},
    "parent": "MKOokP-E7",
    "children": []
  },
  {
    "id": "jSHngZ_ff",
    "type": "keypair",
    "title": "ssh key 3",
    "metadata": {},
    "parent": "MKOokP-E7",
    "children": []
  },
  {
    "id": "EAb6frJc5",
    "type": "volume",
    "title": "硬盘 4",
    "metadata": {},
    "parent": "MKOokP-E7",
    "children": []
  }
];

const connectionRules = {
  instance: [{ resourceType: 'vxnet-0' }, { resourceType: 'vxnet' }, { resourceType: 'security_group' }, { resourceType: 'loadbalancer_backend', connectionType: 'secondary' }],
  volume: [{ resourceType: 'instance' }],
  router: [{ resourceType: 'vxnet-0' }, { resourceType: 'security_group' }],
  vxnet: [{ resourceType: 'router' }],
  eip: [{ resourceType: 'instance' }, { resourceType: 'router' }, { resourceType: 'loadbalancer' }],
  security_group: [{ resourceType: 'vxnet-0' }, { resourceType: 'instance' }, { resourceType: 'cluster' }],
  loadbalancer: [{ resourceType: 'vxnet-0' }, { resourceType: 'security_group' }, { resourceType: 'vxnet' }],
  keypair: [{ resourceType: 'instance' }],
  cluster: [{ resourceType: 'vxnet-0' }, { resourceType: 'security_group' }, { resourceType: 'vxnet' }],
  loadbalancer_listener: [{ resourceType: 'loadbalancer' }],
  loadbalancer_backend: [{ resourceType: 'loadbalancer_listener' }],
};

const sourceMapper = {
  instance: {
    label: '主机',
    icon: 'static/display.svg',
  },
  volume: {
    label: '硬盘',
    icon: 'static/storage.svg',
  },
  eip: {
    label: 'EIP',
    icon: 'static/storage.svg',
  },
  vxnet: {
    label: '网络',
    icon: 'static/network.svg',
  },
  keypair: {
    label: 'ssh key',
    icon: 'static/key.svg',
  },
  router: {
    label: '路由器',
    icon: 'static/router.svg',
  },
  loadbalancer: {
    label: '负载均衡器',
    icon: 'static/router.svg',
  },
  loadbalancer_listener: {
    label: '负载均衡器监听器',
    icon: 'static/router.svg',
  },
  loadbalancer_backend: {
    label: '负载均衡器后端',
    icon: 'static/router.svg',
    connectionType: 'secondary',
  }
};

export {
  data,
  connectionRules,
  sourceMapper,
} ;
