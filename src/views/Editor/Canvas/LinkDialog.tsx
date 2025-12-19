import React, { useEffect, useRef, useState, useMemo } from "react";
import { useMainStore, useSlidesStore } from "@/store";
import type { ElementLinkType, PPTElementLink } from "@/types/slides";
import useLink from "@/hooks/useLink";
import ThumbnailSlide from "@/views/components/ThumbnailSlide";
import styles from "./LinkDialog.module.scss";
import clsx from "clsx";

interface LinkDialogProps {
  onClose: () => void;
}

/**
 * 链接配置弹窗：支持网页链接与幻灯片页面两种类型的链接设置
 */
const LinkDialog: React.FC<LinkDialogProps> = ({ onClose }) => {
  const { handleElementId, setDisableHotkeysState } = useMainStore();
  const { slides, currentSlide } = useSlidesStore();

  const [type, setType] = useState<ElementLinkType>("web");
  const [address, setAddress] = useState("");
  const [slideId, setSlideId] = useState("");

  const { setLink } = useLink();
  const inputRef = useRef<HTMLInputElement>(null);

  const slideOptions = useMemo(() => {
    return slides.map((item, index) => ({
      label: `幻灯片 ${index + 1}`,
      value: item.id,
      disabled: currentSlide?.id === item.id,
    }));
  }, [slides, currentSlide]);

  const selectedSlide = useMemo(() => {
    if (!slideId) return null;
    return slides.find((item) => item.id === slideId) || null;
  }, [slideId, slides]);

  /**
   * 初始化弹窗：设置默认值、读取已有链接并聚焦输入框；挂载期间禁用快捷键
   */
  useEffect(() => {
    setDisableHotkeysState(true);

    const firstValidSlide = slides.find((item) => item.id !== currentSlide?.id);
    if (firstValidSlide) setSlideId(firstValidSlide.id);

    const handleElement =
      currentSlide?.elements.find((el) => el.id === handleElementId) || null;
    if (handleElement?.link) {
      setType(handleElement.link.type);
      if (handleElement.link.type === "web") {
        setAddress(handleElement.link.target);
      } else if (handleElement.link.type === "slide") {
        setSlideId(handleElement.link.target);
      }
    }

    if (type === "web") {
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    return () => {
      setDisableHotkeysState(false);
    };
  }, []);

  /**
   * 保存链接：校验并写入当前元素的链接信息
   */
  const save = () => {
    const link: PPTElementLink = {
      type: type,
      target: type === "web" ? address : slideId,
    };
    const handleElement =
      currentSlide?.elements.find((el) => el.id === handleElementId) || null;
    if (handleElement) {
      const success = setLink(handleElement, link);
      if (success) onClose();
      else setAddress("");
    }
  };

  return (
    <div className={styles.linkDialogMask} onClick={onClose}>
      <div className={styles.linkDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tabs}>
          <div
            className={clsx(styles.tab, { [styles.active]: type === "web" })}
            onClick={() => setType("web")}
          >
            网页链接
          </div>
          <div
            className={clsx(styles.tab, { [styles.active]: type === "slide" })}
            onClick={() => setType("slide")}
          >
            幻灯片页面
          </div>
        </div>

        <div className={styles.content}>
          {type === "web" ? (
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="请输入网页链接地址"
            />
          ) : (
            <>
              <select
                className={styles.input}
                value={slideId}
                onChange={(e) => setSlideId(e.target.value)}
              >
                {slideOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {selectedSlide && (
                <div className={styles.preview}>
                  <div>预览：</div>
                  <ThumbnailSlide
                    className={styles.thumbnail}
                    slide={selectedSlide}
                    size={500}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.btns}>
          <button className={styles.btn} onClick={onClose}>
            取消
          </button>
          <button className={clsx(styles.btn, styles.primary)} onClick={save}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkDialog;
