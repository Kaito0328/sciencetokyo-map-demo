# sciencetokyo-map-demo

東京科学大学（旧東京工業大学）大岡山キャンパスのマップデモアプリケーションです。

## 免責事項

本アプリは学生による研究プロジェクトであり、大学公式によるものではありません。掲載されている情報は最新ではない可能性があります。本アプリの利用によって生じた不利益について、開発者および大学は一切の責任を負いません。

## 使用技術

- **Frontend**: React, Next.js, TypeScript
- **Map**: Leaflet, React-Leaflet
- **Search**: Fuse.js

## 環境設定

本アプリは `.env` ファイルによる Basic 認証（パスワード保護）に対応しています。デプロイ時や公開環境では適切な環境変数を設定してください。

## 使い方

### 必要なファイル

本リポジトリには地図画像やデータファイルが含まれていません。動作させるには、以下のファイルを `frontend/public` 配下に配置してください。

```
frontend/public/
├── data/
│   ├── areas.json
│   ├── buildings.json
│   ├── campus.json
│   ├── floorplans-manifest.json
│   ├── lectures.json
│   └── rooms.json
├── floorplans/
│   ├── M/          <-- 建物コードごとのフォルダ
│   │   ├── 1F.png
│   │   └── ...
│   └── W5/
│       └── ...
└── img/
    └── map/
        └── ookayama-map.png  <-- キャンパスマップ画像
```

### 起動方法

Dev Container を使用している場合、コンテナ起動時に自動的にセットアップされます。

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## データ出典

本アプリケーションの講義室データやフロアマップ情報は、以下のWebサイトおよび資料を参照して作成しました。

- キャンパスマップ: [大岡山キャンパスマップ](https://admissions.titech.ac.jp/0/access/ookayama)
- フロアマップ: [講義室一覧](https://www.titech.ac.jp/student/pdf/facilities-rooms-lectureroom.pdf)
- 講義室情報: [大岡山地区設備一覧](https://www.titech.ac.jp/student/students/facilities/rooms/ookayama)